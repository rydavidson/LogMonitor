package net.noip.codebox.logmonitor.web;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Date;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import net.noip.codebox.logmonitor.config.ILog;
import net.noip.codebox.logmonitor.config.IOptions;
import net.noip.codebox.logmonitor.config.IStyle;
import net.noip.codebox.logmonitor.target.Factory;
import net.noip.codebox.logmonitor.target.IMonitorable;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public class ResponseBuilder {
    @SuppressWarnings("unchecked")
    public static void makeErrorResponse(HttpServletResponse response, String message) throws IOException{
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("error", message);
        sendResponse(response, jsonObject.toString() );
    }
    
    @SuppressWarnings("unchecked")    
    public static void makeResponseGetLatest(HttpServletResponse response, String targetId, List<List<String>> text) throws IOException{
        JSONArray jsonResultArray = new JSONArray();
        JSONArray jsonRowArray;
        
        for(List<String> line : text ){
            jsonRowArray = new JSONArray();

            for( String part : line ){
                jsonRowArray.add(part);
            }
            jsonResultArray.add(jsonRowArray);
        }
        sendResponse(response, jsonResultArray.toString() );
    }
    
    @SuppressWarnings("unchecked")
    public static void makeResponseListTargets(HttpServletResponse response, Factory factory) throws IOException{
        Map<String, ILog> logDetails = factory.getLogDetails();
        
        JSONObject jsonObject       = new JSONObject();
        JSONArray  jsonTargetsArray = new JSONArray();
        JSONObject jsonTargetObject;
        
        IOptions defaultOptions;
        List<IStyle> defaultStyles;
        IMonitorable target;
        
        for(ILog logInfo : logDetails.values() ){
            target = factory.getTarget(logInfo.getName()); 
            if (target != null){
             // This means that the target has been verified
                jsonTargetObject = new JSONObject();
                jsonTargetObject.put("name", logInfo.getName());
                jsonTargetObject.put("lastQueryTime", (new Date()).getTime());
                
                defaultOptions = logInfo.getDefaultOptions(); 
                if ( defaultOptions != null){
                    if (defaultOptions.isShowDividers() != null){
                        jsonTargetObject.put("showDividers", defaultOptions.isShowDividers().booleanValue());
                    }
                    if (defaultOptions.getInterval() != null){
                        jsonTargetObject.put("refreshInterval", defaultOptions.getInterval().intValue());
                    }
                    if (defaultOptions.getLines() != null){
                        jsonTargetObject.put("lineCount", defaultOptions.getLines().intValue());
                    }
                }
                
                defaultStyles = logInfo.getDefaultStyles();
                if (defaultStyles!=null) {
                    JSONObject jsonStyleObject;
                    JSONArray  jsonStylesArray = new JSONArray();
                    for (IStyle style : defaultStyles){
                        jsonStyleObject = new JSONObject();
                        if (style.isVisible() != null) {
                            jsonStyleObject.put("visible", style.isVisible());
                        }
                        if (style.getForeColour() != null) {
                            jsonStyleObject.put("foreColour", style.getForeColour());
                        }
                        if (style.getBackColour() != null) {
                            jsonStyleObject.put("backColour", style.getBackColour());
                        }
                        jsonStylesArray.add(jsonStyleObject);
                    }
                    jsonTargetObject.put("colStyles", jsonStylesArray);
                }
                
                jsonTargetsArray.add(jsonTargetObject);
                
            }
            
        }
        jsonObject.put("targets", jsonTargetsArray);
        
        sendResponse(response, jsonObject.toString() );
    }
    
    @SuppressWarnings("unchecked")
    public static void makeResponseHasUpdated(HttpServletResponse response, String targetId, long lastUpdateTime, boolean hasUpdatedSinceLast) throws IOException{
        JSONObject jsonObject = new JSONObject();
        
        jsonObject.put("lastUpdateTime", lastUpdateTime);
        jsonObject.put("hasUpdated",     hasUpdatedSinceLast);
        
        sendResponse(response, jsonObject.toString() );
    }

    @SuppressWarnings("unchecked")
    public static void makeResponseConfigData(HttpServletResponse response, Map<String,String> configData) throws IOException{
        JSONObject jsonObject = new JSONObject();
        
        for (Map.Entry<String,String> entry : configData.entrySet()){
            jsonObject.put(entry.getKey(), entry.getValue());            
        }
        sendResponse(response, jsonObject.toString() );
    }

    private static void sendResponse(HttpServletResponse response, String responseContent) throws IOException{
        response.setContentType("application/json");
        PrintWriter writer = response.getWriter();
        writer.print(responseContent);
        writer.close();
    }
    
}
