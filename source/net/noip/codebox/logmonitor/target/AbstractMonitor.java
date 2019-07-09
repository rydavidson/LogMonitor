package net.noip.codebox.logmonitor.target;

import java.util.List;
import java.util.regex.Pattern;

public abstract class AbstractMonitor implements IMonitorable {
    private Pattern filter;
    protected String name;
    
    protected boolean includeEntry(List<String> entry){
        if (filter==null){
            return true;
            
        } else {
            boolean matches = false;
            for(String item : entry){
                matches = filter.matcher(item).matches();
                if (matches){
                    break;
                }
            }
            return matches;
        }
    }

    void setFilter(Pattern filter){
        this.filter = filter;
    }
    
    public String getName(){
        return this.name;
    }
}
