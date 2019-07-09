package net.noip.codebox.logmonitor.target;

import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import net.noip.codebox.logmonitor.config.ConfigFile;
import net.noip.codebox.logmonitor.config.ILog;
import net.noip.codebox.logmonitor.config.IMonitor;

public class Factory {
    private static Logger logger = Logger.getLogger("net.noip.codebox.logmonitor.target.Factory");    
    Map<String,IMonitorable> logObjectMap = new LinkedHashMap<String,IMonitorable>();
    Map<String,ILog> logDetailsMap;
    Map<String,String> configData;
    
    public Factory(ConfigFile config){
        logger.info("Loading targets...");
        
        logDetailsMap = config.getLogMap();
        Map<String,IMonitor> monitorMap = config.getMonitorMap();
        
        configData = config.getConfigMap();
        
        String logType;
        IMonitor monitor;
        Constructor constructor;
        AbstractMonitor logMonitor;
        String logName;
        
         for (ILog log : logDetailsMap.values()){
            logType = log.getType();
            logName = log.getName();
            monitor = monitorMap.get(logType);
            
            if (monitor != null) {
                try{
                    constructor = monitor.getClassObject().getConstructor(String.class, String.class);
                    logMonitor  = (AbstractMonitor)constructor.newInstance(logName, log.getLocation());
                    logMonitor.setFilter(log.getFilter());

                    logName = log.getName();
                    
                    //boolean verified = logMonitor.verify();
                    //if (verified) {
                        logObjectMap.put(logName, logMonitor);
                        logger.info("Loaded target '" + logName + "' OK.");
                        
                    //} else {
                    //    logger.warning("Verification of the log '" + logName + "' failed. Skipping this log");
                    //}
                    
                } catch (Exception ex) {
                    logger.warning("Unable to create a monitor for the log '" + log 
                            + "' which requires an instance of the class '" + monitor.getClassObject().getName()
                            + "'. The original error was: " + ex.getMessage() + ". Skipping this log.");
                }
                
            } else {
                logger.warning("Unknown log type of '" + logType + "' was specified for log '" 
                        + log.getName() + "'. Skipping this log.");
            }
        }
        
        logger.info("Loading targets complete.");
    }
    
    public synchronized List<String> getTargetNames(){
        return new ArrayList<String>(logObjectMap.keySet());
    }
    public synchronized IMonitorable getTarget(String id){
        if ( logObjectMap.containsKey(id)){
            return logObjectMap.get(id);
        } else {
            return null;
        }
    }
    public synchronized Map<String,ILog> getLogDetails(){
        return Collections.unmodifiableMap(logDetailsMap);
    }
    
    public synchronized Map<String,String> getConfigData(){
        return Collections.unmodifiableMap(configData);
    }
    
}
