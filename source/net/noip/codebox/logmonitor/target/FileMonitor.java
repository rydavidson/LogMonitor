package net.noip.codebox.logmonitor.target;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

public class FileMonitor extends AbstractMonitor {
    private static final Logger logger = Logger.getLogger("net.noip.codebox.logmonitor.target.FileMonitor");
    private static final String EOL = System.getProperty("line.separator");
    private static final int CHUNK_SIZE = 100;
    private Map<String, Integer> dateMarkers;
    private boolean dynamicFileName;
    
    private final String filePath;
    
    public FileMonitor(String name, String filePath){
        this.filePath = filePath;
        this.name = name;
        setupDateMarkersMap();
        this.dynamicFileName = containsDynamicMarkers(filePath);
    }
    
    public String getDescription() {
        return "File " + filePath;
    }
    
    private File getFile(){
        return new File(getFileName());
    }

    private String getFileName(){
        if (dynamicFileName){
            return processFilePath(filePath);
        } else {
            return filePath;
        }
    }
    
    private void setupDateMarkersMap(){
        dateMarkers = new HashMap<String, Integer>();
        dateMarkers.put("%y%", Calendar.YEAR);
        dateMarkers.put("%M%", Calendar.MONTH);
        dateMarkers.put("%d%", Calendar.DAY_OF_MONTH);
        dateMarkers.put("%H%", Calendar.HOUR_OF_DAY);
        dateMarkers.put("%m%", Calendar.MINUTE);
        dateMarkers.put("%s%", Calendar.SECOND);
    }
    
    private String processFilePath(String filePath){
        String processedPath = filePath;
        Calendar now = Calendar.getInstance();
        
        String markerValue;
        int dateComponentValue, dataComponent;
        for (String marker : dateMarkers.keySet()){
            if (filePath.contains(marker)){
            	dataComponent      = dateMarkers.get(marker);
                dateComponentValue = now.get(dataComponent);
                
             // Compensate for retarded month values starting at 0   
                if (dataComponent == Calendar.MONTH){
                	dateComponentValue++;
                }
                
                if (dateComponentValue < 10){
                    markerValue = "0" + dateComponentValue;
                } else {
                    markerValue = "" + dateComponentValue;
                }
                processedPath = processedPath.replace(marker, markerValue);
            }
        }
        return processedPath;
    }
    
    private boolean containsDynamicMarkers(String filePath){
        boolean foundMarker = false;
        for (String marker : dateMarkers.keySet()){
            if (filePath.contains(marker)){
                foundMarker = true;
                break;
            }
        }
        return foundMarker;
    }
    
    public List<List<String>> getLatestEntries(int entryCount) throws TargetAccessException {
        List<List<String>> text = new ArrayList<List<String>>();
        List<String> thisLine;
        FileChannel channel = null;
        FileLock lock = null;
        
        try {
            if (!verify() ){
                throw new IOException("Unable to verify file '" + getFileName() + "'");
            }
            
         // Need to open 'rw' so that we can lock the file 
            RandomAccessFile raf = new RandomAccessFile(getFile(),"rw"); 
            channel = raf.getChannel(); 
            lock    = channel.lock();

         // This is used to store data read from the file    
            byte[] bytes = new byte[CHUNK_SIZE];
            
            String leftOvers = "";
            
         // Work out where we will start reading from on the first check of the file 
            long initialPointer = raf.length() - CHUNK_SIZE;
            if ( initialPointer < 0 ){
                initialPointer = 0;
            }
            raf.seek(initialPointer);
            
            int fileLength = (int)raf.length();
            
         // Work out the size of the first 'chunk' of data to be read from the file
            int chunkSize = (initialPointer + CHUNK_SIZE > fileLength ) ? fileLength : CHUNK_SIZE;

            int startPosition;    // Pointer set to 1st char to read
            int currentPointer;    
            int bytesRead;        // Number of bytes read, always CHUNK_SIZE or less
            String chunk;        // Data read from the file
            String[] parts;        // Data read from the file, split into lines;
            
            /*
             * This loop reads data from the file in pieces of CHUNK_SIZE bytes. It starts at the
             * end of the file and moves backwards towards the beginning. Each time a chunk is 
             * read, the code checks it for end-of-line characters, any complete lines of text that are 
             * found in the chunk are added to the 'text' ArrayList, any partial-lines (ie any data
             * for which a preceeding EOL character has not yet been found) are held in the 'leftOvers' 
             * variable and appended to the next chunk to be read. The loop terminates when the 
             * required number of complete lines have been read, or the start of the file has been reached.
             */
            outer: while(true){
                currentPointer = (int)raf.getFilePointer();
                startPosition  = currentPointer;
                
                bytesRead = raf.read(bytes, 0, chunkSize);
                if ( bytesRead <= 0 ){
                    break;
                }
                
                chunk = new String(bytes).substring(0, bytesRead);
                chunk += leftOvers;
                parts = chunk.split(EOL);
                
                leftOvers = parts[0];
                if ( chunk.startsWith(EOL)){
                    assert leftOvers.length() == 0 : "Expected empty 'leftOvers' variable";
                    /*
                     * if the chunk started with an EOL then we need to put an EOL back into the 'leftOver'
                     * variable (they are all removed when we split the String) so that when we append the
                     * leftOver data onto the next chunk, that chunk has an EOL in the appropriate place.
                     */ 
                    leftOvers = EOL + leftOvers;
                }
                
                for(int i = parts.length - 1; i > 0 ; i--){
                    thisLine = new ArrayList<String>();
                    thisLine.add(parts[i]);
                    if (includeEntry(thisLine)){
                        text.add(0,thisLine);
                    }
                }
                
                if ( text.size() >= entryCount ){
                    /* 
                     * We have found the required number of lines, so stop reading. Note that this may result
                     * in more lines being returned that were actually asked for, since data is read in chunks
                     * and there is no way to know in advance how may lines we will end up with after a chunk has 
                     * been read. There doesn't seem to be any point in throwing away data that we have already 
                     * read, so don't remove the excess lines, just return them.
                     */
                    break;
                }
                
                if ( startPosition == 0 ){
                    /* 
                     * We have reached the start of the file. If there is anything in the 'leftOvers' field, and
                     * we don't yet have the required number of lines, then add this to the list - it should be a 
                     * complete line.
                     */    
                    if ( leftOvers.length() > 0 && text.size() < entryCount){
                        thisLine = new ArrayList<String>();
                        thisLine.add(leftOvers);
                        if (includeEntry(thisLine)){
                            text.add(0,thisLine);
                        }
                    }
                    break;
                    
                } else {
                    if ( startPosition < CHUNK_SIZE ){
                        /*
                         * We don't have enough data left in the file to read a complete chunk on the next iteration,
                         * so size the next chunk to read everything that's left.
                         */
                        raf.seek(0);
                        chunkSize = startPosition;
                        
                    } else {
                        /*
                         * Move back 1 chunksworth 
                         */
                        raf.seek(startPosition - CHUNK_SIZE);
                        //chunkSize = (currentPointer + CHUNK_SIZE > fileLength ) ? fileLength : CHUNK_SIZE;
                        chunkSize = CHUNK_SIZE;
                    }
                }
            }
        } catch (IOException ex){
            throw new TargetAccessException(this.getName(), 
                    "IOException while trying to access the file '" + getFileName() + "'", ex);
            
        } finally {
            if (lock != null){
                try {
                    lock.release();
                } catch (IOException ex) {
                    logger.warning("Unable to close file " + this.filePath);
                }
            }
            
            if ( channel != null ) {
                try{
                    channel.close(); 
                } catch (Exception ex) {
                    logger.warning("Unable to close file " + this.filePath);
                }
            } 
        }
        
        return text;
    }

    public long lastUpdateTime() throws TargetAccessException {
        long lastModTime = getFile().lastModified();
        if (lastModTime > 0){
            return lastModTime;    
        } else {
            throw new TargetAccessException(this.getName(), "Unable to access the file target '" + getFileName() + "'");
        }
        
    }
    public boolean verify() {
        return getFile().exists();
    }

}
