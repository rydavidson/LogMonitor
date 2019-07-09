package net.noip.codebox.logmonitor.config;

class OptionsBean implements IOptions{
    private Boolean showDividers;
    private Integer lines;
    private Integer interval;
    
    public Integer getInterval() {
        return interval;
    }
    void setInterval(Integer interval) {
        this.interval = interval;
    }
    public Integer getLines() {
        return lines;
    }
    void setLines(Integer lines) {
        this.lines = lines;
    }
    public Boolean isShowDividers() {
        return showDividers;
    }
    void setShowDividers(Boolean showDividers) {
        this.showDividers = showDividers;
    }
    
}
