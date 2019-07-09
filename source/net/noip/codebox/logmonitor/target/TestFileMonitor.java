package net.noip.codebox.logmonitor.target;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class TestFileMonitor extends AbstractMonitor {
    private final String name;
    private static final DateFormat LOG_DATE_FORMAT = new SimpleDateFormat("dd/MMM/yyyy:HH:mm:ss Z");
    
    private static final int[] UPDATES = {1,0,0,3,0,1,1,2};
    
    private static final int BAIL_OUT_VALUE = 1000;
    
    private static final String[] HOSTS    = {"192.168.0.1", "192.168.0.2", "192.168.0.3", "192.168.0.4", "192.168.0.5"};
    private static final String[] IDENTS   = {"-"};
    private static final String[] USERIDS  = {"-"};
    private static final String[] REQUESTS = {"GET /index.html HTTP/1.0", "GET /testpage1.html HTTP/1.0", 
        "GET /graphics/fasteddie.jpg HTTP/1.0", "GET favicon.ico HTTP/1.1", "POST /cgi-bin/login.php HTTP/1.1"};
    private static final String[] CODES    = {"200", "200", "200", "302", "304", "200", "200", "404", "200"};
    private static final String[] SIZES    = {"1234", "2000", "1024", "32000", "32"};
    private static final String[] REFERERS = {"http://www.google.com", "-", "-", "http://slashdot.org", "-", "http://whitehouse.gov",
        "http://codebox.no-ip.net", "-", "-"};
    private static final String[] AGENTS   = {"Mozilla/4.08 [en] (Win98; I ;Nav)", "-", "-", 
        "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; .NET CLR 1.1.4322)",
        "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1",
        "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.1) Gecko/20060601 Firefox/2.0 (Ubuntu-edgy)",
        "Speedy Spider (Entireweb; Beta/1.0; http://www.entireweb.com/about/search_tech/speedyspider/)",
        "-", "-"};
    
    public TestFileMonitor(String name, String location){
     // location is ignored
        this.name = name;
    }
    
    public String getDescription() {
        return "Test " + name;
    }

    public List<List<String>> getLatestEntries(int entryCount) {
        int entriesFound = 0;
        
        long timeNowInMillis = (new Date()).getTime();
        long timeNowInSecs   = timeNowInMillis / 1000;
        
        int updatesIndexForNow = (int)(timeNowInSecs % UPDATES.length);
        int updatesIndexToCheck = updatesIndexForNow;
        int updatesFound;
        int loopCounter = 0;
        
        List<List<String>> entries = new ArrayList<List<String>>();
        String dateText;
        long timeToCheckInSecs = timeNowInSecs;
        
        List<String> logEntry;
        while (entriesFound < entryCount){
            updatesFound = UPDATES[updatesIndexToCheck]; 
            if ( updatesFound > 0 ){
                for (int i = 0; i < updatesFound; i++){
                    dateText = makeDateStringFromTS(timeToCheckInSecs * 1000);
                    logEntry = buildLogEntry(timeToCheckInSecs + i, dateText);
                    if (includeEntry(logEntry)){
                        entries.add(logEntry);
                        entriesFound++;
                    }
                }
            }
            
            updatesIndexToCheck--;
            if ( updatesIndexToCheck < 0){
                updatesIndexToCheck += UPDATES.length;
            }
            
            // Make sure we never get stuck in a loop - conceptually this represents hitting the top of the file
            if (++loopCounter > BAIL_OUT_VALUE) {
                break;
            }
            
            timeToCheckInSecs--;
        }
        
        return entries;
    }

    public long lastUpdateTime() {
        long timeNowInMillis = (new Date()).getTime();
        long timeNowInSecs   = timeNowInMillis / 1000;
        
        int updatesIndexForNow = (int)(timeNowInSecs % UPDATES.length);
        int index;
        
        long latestUpdateTimeInSecs=0;
        
        for(int i = 0, l = UPDATES.length; i < l; i++){
            index = updatesIndexForNow - i;
            if(index<0){
                index += UPDATES.length;
            }
            if (UPDATES[index] > 0){
                latestUpdateTimeInSecs = timeNowInSecs - i;
                break;
            }
        }
        
        return latestUpdateTimeInSecs * 1000;
    }
    
    public boolean verify() {
        return true;
    }
    
    private List<String> buildLogEntry(long number, String date){
        assert number > 0;
        
        List<String> entry = new ArrayList<String>();
        
        entry.add(HOSTS[(int)(number % HOSTS.length)] + " ");
        entry.add(IDENTS[(int)(number % IDENTS.length)] + " ");
        entry.add(USERIDS[(int)(number % USERIDS.length)] + " ");
        entry.add(date + " ");
        entry.add(REQUESTS[(int)(number % REQUESTS.length)] + " ");
        entry.add(CODES[(int)(number % CODES.length)] + " ");
        entry.add(SIZES[(int)(number % SIZES.length)] + " ");
        entry.add(REFERERS[(int)(number % REFERERS.length)] + " ");
        entry.add(AGENTS[(int)(number % AGENTS.length)] + " ");
        
        return entry;
        
    }
    
    private String makeDateStringFromTS(long timeStamp){
        Date date = new Date(timeStamp);
        
        return "[" + LOG_DATE_FORMAT.format(date) + "]";
    }

}
