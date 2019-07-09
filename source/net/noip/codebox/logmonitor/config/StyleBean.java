package net.noip.codebox.logmonitor.config;

public class StyleBean implements IStyle{
    private Boolean visible;
    private String foreColour;
    private String backColour;
    
    public String getBackColour() {
        return backColour;
    }
    void setBackColour(String backColour) {
        this.backColour = backColour;
    }
    public String getForeColour() {
        return foreColour;
    }
    void setForeColour(String foreColour) {
        this.foreColour = foreColour;
    }
    public Boolean isVisible() {
        return visible;
    }
    void setVisible(Boolean visible) {
        this.visible = visible;
    }
}
