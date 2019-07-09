package net.noip.codebox.logmonitor.target;

import java.util.ArrayList;
import java.util.List;

public class LogFileMonitor extends AbstractMonitor {
    private IMonitorable fileMonitor;
    private String filePath;
    
    public LogFileMonitor(String name, String filePath){
        fileMonitor   = new FileMonitor(name, filePath);
        this.filePath = filePath;
        this.name     = name;
    }
    
    /*public LogFileMonitor(String name, IMonitorable fileMonitor){
        this.fileMonitor = fileMonitor;
        this.filePath    = name;
    }*/
    
    public String getDescription() {
        return "Log File: " + filePath;
    }

    public List<List<String>> getLatestEntries(int entryCount) throws TargetAccessException{
        List<List<String>> fileEntries = fileMonitor.getLatestEntries(entryCount);
        List<List<String>> logEntries = new ArrayList<List<String>>(fileEntries.size());
        
        int rowIndex=1;
        for(List<String> entry: fileEntries){
            logEntries.add( markUpEntry(entry.get(0),rowIndex++) );
        }
        
        return logEntries;
    }
    
    //TODO escape HTML entities
    private List<String> markUpEntry(String entry, int rowCounter){
        List<String> result = new ArrayList<String>();
        List<String> parts = splitEntry(entry);
        
        for(String part : parts){
            result.add(part);
        }
        
        return result;
    }
    
    private List<String> splitEntry(String entry){
        List<String> parts = new ArrayList<String>();
        
        boolean insideQuotes = false;
        boolean insideBrackets = false;
        StringBuilder thisPart = new StringBuilder();
        for( char c : entry.toCharArray() ){
            if ( c == ' '){
                if ( !insideQuotes && !insideBrackets){
                    parts.add(thisPart.toString());
                    thisPart = new StringBuilder();
                } 
            } else if ( c == '"'){
                if ( !insideBrackets ){
                    insideQuotes = !insideQuotes;
                }
                
            } else if ( c == '['){
                if ( !insideQuotes && !insideBrackets){
                    insideBrackets = true;                
                }

            } else if ( c == ']'){
                if ( !insideQuotes && insideBrackets ){
                    insideBrackets = false;                
                }
                
            } 
            thisPart.append(c);

        }        
        if ( thisPart.length() > 0 ){
            parts.add(thisPart.toString());
        }
        
        return parts;
    }
    
    public long lastUpdateTime() throws TargetAccessException {
        return fileMonitor.lastUpdateTime();
    }

    public boolean verify() {
        return fileMonitor.verify();
    }

}
