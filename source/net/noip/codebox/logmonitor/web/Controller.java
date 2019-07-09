package net.noip.codebox.logmonitor.web;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.logging.Logger;

import net.noip.codebox.logmonitor.config.ConfigFile;
import net.noip.codebox.logmonitor.target.Factory;
import net.noip.codebox.logmonitor.target.IMonitorable;
import net.noip.codebox.logmonitor.target.TargetAccessException;

public class Controller extends HttpServlet {    
    private static final long serialVersionUID = -1970875009284523737L;
    private static Logger logger = Logger.getLogger("net.noip.codebox.logmonitor.web.Controller");
    
    public static final String PARAM_REQ_TYPE  = "requestType";
    public static final String PARAM_TARGET_ID = "targetId";
    public static final String PARAM_LAST_QUERY = "lastQueryTime";
    public static final String PARAM_LINE_COUNT = "lineCount";
    
    public static final String REQ_HAS_UPDATED  = "hasUpdated";
    // http://localhost:8080/LogMonitor/servlet/Controller?requestType=hasUpdated&targetId=bob&lastQueryTime=1157815927395
    
    public static final String REQ_LIST_TARGETS = "listTargets";
    // http://localhost:8080/LogMonitor/servlet/Controller?requestType=listTargets
    
    public static final String REQ_GET_LATEST = "getLatest";
    // http://localhost:8080/LogMonitor/servlet/Controller?requestType=getLatest&targetId=bob&lineCount=10

    public static final String REQ_GET_CONFIG = "getConfig";
    // http://localhost:8080/LogMonitor/servlet/Controller?requestType=getConfig

    private static final String targetsFile = "/WEB-INF/config.xml";
    private Factory factory;
    
    public Controller() {
        super();
    }

    public void doGet(HttpServletRequest req, HttpServletResponse rsp) throws ServletException, IOException {
        logger.fine("Request params: " + req.getQueryString());
        
        String requestType = req.getParameter(PARAM_REQ_TYPE);
        
        if ( requestType != null ){
         // delegate to the appropriate handler    
            if ( REQ_HAS_UPDATED.equalsIgnoreCase(requestType)){
                processHasUpdated(req, rsp);
                
            } else if ( REQ_LIST_TARGETS.equalsIgnoreCase(requestType) ){
                processListTargets(req, rsp);

            } else if ( REQ_GET_LATEST.equalsIgnoreCase(requestType) ){
                processGetLatest(req, rsp);
                
            } else if (REQ_GET_CONFIG.equalsIgnoreCase(requestType)){
                processGetConfig(req, rsp);
                
            } else {
                ResponseBuilder.makeErrorResponse(rsp, "Bad Request: Unknown request type parameter '" + requestType + "'");                        
            }
            
        } else {
            getServletContext().getRequestDispatcher("/Main.jsp").forward(req, rsp);    

        }
    }
    
    private void processGetLatest(HttpServletRequest req, HttpServletResponse rsp) throws IOException{
        try{
            String targetId = req.getParameter(PARAM_TARGET_ID);
            if ( targetId == null ){
                throw new IllegalArgumentException( REQ_GET_LATEST + " requests must have a " + PARAM_TARGET_ID + " parameter");                
            }
            
            String lineCount = req.getParameter(PARAM_LINE_COUNT);
            int lineCountNum = 0;
            if ( lineCount != null ){
                try{
                    lineCountNum = Integer.parseInt(lineCount);
                } catch (NumberFormatException ex){
                    throw new IllegalArgumentException( PARAM_LINE_COUNT + " parameter value must be numeric");
                }                                
            }

            IMonitorable target = factory.getTarget(targetId);
            if ( target == null ){
                throw new IllegalArgumentException( REQ_GET_LATEST + " request contained an unknown " + PARAM_TARGET_ID + " value of '" + targetId + "'");
            }
            List<List<String>> latest = target.getLatestEntries(lineCountNum);
            
            ResponseBuilder.makeResponseGetLatest(rsp, targetId, latest);
            
        } catch (IllegalArgumentException ex){
            ResponseBuilder.makeErrorResponse(rsp, "Bad Request: " + ex.getMessage() );
            
        } catch (TargetAccessException ex) {
            ResponseBuilder.makeErrorResponse(rsp, "Target Access Error [" + ex.getTargetId() + "] " + ex.getMessage() );
            
        }

    }

    private void processListTargets(HttpServletRequest req, HttpServletResponse rsp) throws IOException{
        ResponseBuilder.makeResponseListTargets(rsp, factory);
    }
    
    private void processGetConfig(HttpServletRequest req, HttpServletResponse rsp) throws IOException{
        ResponseBuilder.makeResponseConfigData(rsp, factory.getConfigData());
    }

    private void processHasUpdated(HttpServletRequest req, HttpServletResponse rsp) throws IOException{
        /* 
         * PARAM_TARGET_ID parameter is mandatory
         * PARAM_LAST_QUERY is optional and defaults to 0
         */
        try{
            String targetId = req.getParameter(PARAM_TARGET_ID);
            if ( targetId == null ){
                throw new IllegalArgumentException( REQ_HAS_UPDATED + " requests must have a " + PARAM_TARGET_ID + " parameter");                
            }
            
            String lastQueryTime = req.getParameter(PARAM_LAST_QUERY);
            long lastQueryTimeNum = 0;
            if ( lastQueryTime != null ){
                try{
                    lastQueryTimeNum = Long.parseLong(lastQueryTime);
                } catch (NumberFormatException ex){
                    throw new IllegalArgumentException( PARAM_LAST_QUERY + " parameter value must be numeric");
                }                                
            }

            IMonitorable target = factory.getTarget(targetId);
            if ( target == null ){
                throw new IllegalArgumentException( REQ_HAS_UPDATED + " request contained an unknown " + PARAM_TARGET_ID + " value of '" + targetId + "'");
            }
            long targetLastUpdateTime = target.lastUpdateTime();
            ResponseBuilder.makeResponseHasUpdated(rsp, targetId, targetLastUpdateTime, targetLastUpdateTime > lastQueryTimeNum);
            
        } catch (IllegalArgumentException ex){
            ResponseBuilder.makeErrorResponse(rsp, "Bad Request: " + ex.getMessage() );
            
        } catch (TargetAccessException ex) {
            ResponseBuilder.makeErrorResponse(rsp, "Target Access Error [" + ex.getTargetId() + "] " + ex.getMessage() );

        }
    }

    
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doGet(request, response);
    }
    
    public void init() throws ServletException {
        ConfigFile configFile;
        try {
            configFile = new ConfigFile(getServletContext().getResourceAsStream(targetsFile));
            factory = new Factory(configFile);
        } catch (IOException ex) {
            throw new ServletException("Unable to create the Factory object", ex);
        }
    }
    
    public void destroy() {
        super.destroy(); 
    }

}
