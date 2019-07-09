package net.noip.codebox.logmonitor.target;

public class TargetAccessException extends Exception {
    private static final long serialVersionUID = 5428601287092885351L;
    private String targetId;
    
    public TargetAccessException(String targetId){
        super();
        this.targetId =targetId;
    }
    
    public TargetAccessException(String targetId, String msg){
        super(msg);
        this.targetId =targetId;
    }
    
    public TargetAccessException(String targetId, String msg, Throwable ex){
        super(msg, ex);
        this.targetId =targetId;
    }

    public String getTargetId(){
        return targetId;
    }
}
