package net.noip.codebox.logmonitor.config;

import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;

class LogBean implements ILog {
    private String name;
    private String type;
    private String location;
    private IOptions options; 
    private List<IStyle> styles; 
    private Pattern filter;
    
    LogBean(){}
    
    LogBean(String location, String name, String type) {
        this.location = location;
        this.name = name;
        this.type = type;
    }
    public String getLocation() {
        return location;
    }
    void setLocation(String location) {
        this.location = location;
    }
    public String getName() {
        return name;
    }
    void setName(String name) {
        this.name = name;
    }
    public String getType() {
        return type;
    }
    void setType(String type) {
        this.type = type;
    }
    
    public String toString(){
        return name + " [" + type + ":" + location + "]";
    }

    public IOptions getDefaultOptions() {
        return options;
    }
    public void setDefaultOptions(IOptions options) {
        this.options = options;
    }

    public List<IStyle> getDefaultStyles() {
        if (styles != null){
            return Collections.unmodifiableList(styles);
        } else {
            return null;
        }
    }
    public void setDefaultStyles(List<IStyle> styles){
        this.styles = styles;
    }

    public Pattern getFilter() {
        return filter;
    }
    void setFilter(Pattern filter) {
        this.filter = filter;
    }
}
