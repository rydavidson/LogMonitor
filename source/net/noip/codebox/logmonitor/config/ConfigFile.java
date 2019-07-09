package net.noip.codebox.logmonitor.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import net.noip.codebox.logmonitor.target.AbstractMonitor;

import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;

import java.util.logging.Logger;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

public class ConfigFile {
    private static Logger logger = Logger.getLogger("net.noip.codebox.logmonitor.config.ConfigFile");
    private static final String COLOUR_PATTERN_TEXT = "#[0-9A-Fa-f]{6}";
    private static final Pattern COLOUR_PATTERN = Pattern.compile(COLOUR_PATTERN_TEXT);
    
    private Map<String,ILog>     logMap     = new LinkedHashMap<String,ILog>();
    private Map<String,IMonitor> monitorMap = new HashMap<String,IMonitor>();
    private Map<String,String>   configMap  = new HashMap<String,String>();    
    
    public ConfigFile(InputStream in) throws IOException{
        SAXBuilder builder = new SAXBuilder();
        
        Document doc;
        try {
            doc = builder.build(in);
        } catch (JDOMException ex) {
            throw new IllegalArgumentException("Unable to parse the configuration XML", ex);
        }
        
        Element rootElement = doc.getRootElement();
        
        Element monitorsElement = rootElement.getChild("monitors");
        buildMonitorMap(monitorsElement);
        
        Element logsElement = rootElement.getChild("logs");
        buildLogMap(logsElement);

        Element configsElement = rootElement.getChild("configs");
        buildConfigMap(configsElement);

    }
    
    public Map<String,ILog> getLogMap(){
        return new LinkedHashMap<String,ILog>(logMap){
            private static final long serialVersionUID = 6662540030185069410L;
            
            @Override
            public void clear(){
                throw new UnsupportedOperationException();
            }
            @Override
            public ILog put(String key, ILog value){
                throw new UnsupportedOperationException();
            }
            @Override
            public void putAll(Map<? extends String,? extends ILog> map){
                throw new UnsupportedOperationException();
            }
            @Override
            public ILog remove(Object object){
                throw new UnsupportedOperationException();
            }
        };
    }
    
    public Map<String,IMonitor> getMonitorMap(){
        return Collections.unmodifiableMap(monitorMap);
    }
    
    public Map<String,String> getConfigMap(){
        return Collections.unmodifiableMap(configMap);
    }
    
    private void buildMonitorMap(Element element){
        assert element.getName().equals("monitors") : "Expected 'monitors' element";
        
        List monitorElementsList = element.getChildren("monitor");
        Element monitorElement;
        MonitorBean monitorBean;
        String className = null;
        String monitorType = null;
        
        for(Object item : monitorElementsList){
            try {
                monitorElement = (Element)item;
                assert monitorElement.getName().equals("monitor") : "Expected a 'monitor' element";
                
                monitorBean = new MonitorBean();
                
                monitorType = getRequiredAttributeValue(monitorElement, "type");
                monitorBean.setName(monitorType);
                
                className = getRequiredAttributeValue(monitorElement, "class");

                Class monitorClass = Class.forName(className);
                if (AbstractMonitor.class.isAssignableFrom(monitorClass)) {
                    monitorBean.setClassObject(monitorClass);
                    
                    monitorMap.put(monitorType, monitorBean);
                    
                } else {
                    logger.warning("The className found for monitor '" + monitorType + "' was '" + monitorClass.getName() 
                            + "', which does not implement IMonitorable. Skipping this monitor.");
                }
                
            } catch (ClassNotFoundException ex) {
                logger.warning("Unable to find the class specified for monitor '" + monitorType 
                        + "', the class was '" + className + "'.");
                
            } catch (Exception ex){
                logger.warning("An unexpected exception occurred while attempting to process one of the 'monitor' elements "
                        + " in the configuration file. The error was: " + ex.getMessage());
            }
        }
    }
    
    private void buildLogMap(Element element){
        assert element.getName().equals("logs") : "Expected 'logs' element";
        
        List logElementsList = element.getChildren("log");
        Element logElement;
        LogBean logBean;
        String logName;
        
        for(Object item : logElementsList){
            try {
                logElement = (Element)item;
                assert logElement.getName().equals("log") : "Expected a 'log' element";
                
                logBean = new LogBean();
                logName = getRequiredAttributeValue(logElement, "name");
                logBean.setName(logName);
                logBean.setType(getRequiredAttributeValue(logElement, "type"));
                logBean.setLocation(getRequiredAttributeValue(logElement, "location"));
                logBean.setDefaultOptions(buildOptionsBean(logElement));
                logBean.setDefaultStyles(buildStylesBean(logElement));
                logBean.setFilter(buildFilter(logElement));
                
                logMap.put(logName, logBean);
                
            } catch (Exception ex){
                logger.warning("An unexpected exception occurred while attempting to process one of the 'log' elements "
                        + " in the configuration file. The error was: " + ex);
            }
        }
    }

    private void buildConfigMap(Element element){
        assert element.getName().equals("configs") : "Expected 'configs' element";
        
        List configElementsList = element.getChildren("config");
        Element configElement;
        String configName, configValue;
        
        for(Object item : configElementsList){
            try {
                configElement = (Element)item;
                assert configElement.getName().equals("config") : "Expected a 'config' element";
                
                configName  = getRequiredAttributeValue(configElement, "name");
                configValue = getRequiredAttributeValue(configElement, "value");
                
                configMap.put(configName, configValue);
                
            } catch (Exception ex){
                logger.warning("An unexpected exception occurred while attempting to process one of the 'config' elements "
                        + " in the configuration file. The error was: " + ex);
            }
        }
    }
    
    private Pattern buildFilter(Element element){
        assert element.getName().equals("log") : "Expected a 'log' element";
        
        Element filterElement = element.getChild("filter");
        
        if (filterElement != null){
            String filterExpression = filterElement.getText();
            
            if (filterExpression != null && filterExpression.length() > 0) {
                try{
                    return Pattern.compile(filterExpression);
                    
                } catch (PatternSyntaxException ex){
                    throw new IllegalArgumentException("Bad value for filter element - unable to compile a " +
                            "Pattern object from the String '" + filterExpression + "'");                
                }
            }
            return null;
            
        } else {
            return null;
        }
    }

    private IOptions buildOptionsBean(Element element){
        assert element.getName().equals("log") : "Expected a 'log' element";
        
        Element optionsElement = element.getChild("options");
        if (optionsElement != null){
            OptionsBean optionsBean = new OptionsBean();
            
            optionsBean.setInterval(getOptionalIntAttributeValue(optionsElement, "interval"));
            optionsBean.setLines(getOptionalIntAttributeValue(optionsElement, "lines"));
            optionsBean.setShowDividers(getOptionalBooleanAttributeValue(optionsElement, "showDividers"));

            return optionsBean;
            
        } else {
            return null;
        }
    }
    
    private List<IStyle> buildStylesBean(Element element){
        assert element.getName().equals("log") : "Expected a 'log' element";
        
        Element stylesElement = element.getChild("styles");
        
        if (stylesElement != null){
            List<IStyle> stylesList = new ArrayList<IStyle>();
            List styleElementList = stylesElement.getChildren("style");
            Element styleElement;
            StyleBean styleBean;
            
            for(Object item : styleElementList){
                styleElement = (Element) item;
                styleBean = new StyleBean();
                
                styleBean.setBackColour(getOptionalColourAttributeValue(styleElement, "backColour"));
                styleBean.setForeColour(getOptionalColourAttributeValue(styleElement, "foreColour"));
                styleBean.setVisible(getOptionalBooleanAttributeValue(styleElement,   "visible"));
                
                stylesList.add(styleBean);
            }
            
            return stylesList;
            
        } else {
            return null;
        }

    }
    
    private String getOptionalColourAttributeValue(Element element, String name){
        assert element != null : "Expected non-null Element";
        String attributeValue = element.getAttributeValue(name);
        
        if (attributeValue==null){
            return null;
            
        } else if (COLOUR_PATTERN.matcher(attributeValue).matches()){
            return attributeValue;
            
        } else {
            throw new IllegalArgumentException("Bad value for attribute '" + name 
                    + "', expected value matching regex '" + COLOUR_PATTERN_TEXT 
                    + "', but found '" + attributeValue + "'");
        }
    }
    
    private Boolean getOptionalBooleanAttributeValue(Element element, String name){
        assert element != null : "Expected non-null Element";
        String attributeValue = element.getAttributeValue(name);
        
        if ("true".equals(attributeValue)){
            return Boolean.TRUE;
            
        } else if ("false".equals(attributeValue)){
            return Boolean.FALSE;
            
        } else if (attributeValue==null){
            return null;
            
        } else {
            throw new IllegalArgumentException("Bad value for attribute '" + name 
                    + "', expected 'true' or 'false' but found '" + attributeValue + "'");
        }
    }
    
    private Integer getOptionalIntAttributeValue(Element element, String name){
        assert element != null : "Expected non-null Element";
        String attributeValue = element.getAttributeValue(name);
        
        if (attributeValue == null){
            return null;
            
        } else {
            try{
                return new Integer(attributeValue);
                
            } catch (NumberFormatException ex){
                throw new IllegalArgumentException("Bad value for attribute '" + name 
                        + "', expected a number but found '" + attributeValue + "'");
            }
        }
    }
    
    private String getRequiredAttributeValue(Element element, String name){
        assert element != null : "Expected non-null Element";
        String attributeValue = element.getAttributeValue(name);
        if (attributeValue == null){
            throw new IllegalArgumentException("Missing attribute: expected attribute '" 
                    + name + "' in element " + element.getName());
        }
        return attributeValue;
    }
    
}
