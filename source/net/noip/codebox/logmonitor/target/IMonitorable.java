package net.noip.codebox.logmonitor.target;

import java.util.List;

public interface IMonitorable {
    public long lastUpdateTime() throws TargetAccessException;
    public List<List<String>> getLatestEntries(int entryCount) throws TargetAccessException;
    public String getDescription();
    public boolean verify();
    public String getName();
}
