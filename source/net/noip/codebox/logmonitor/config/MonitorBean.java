package net.noip.codebox.logmonitor.config;

class MonitorBean implements IMonitor{
    private String type;
    private Class classObject;
    
    public Class getClassObject() {
        return classObject;
    }
    void setClassObject(Class classObject) {
        this.classObject = classObject;
    }
    public String getType() {
        return type;
    }
    void setName(String type) {
        this.type = type;
    }

}
