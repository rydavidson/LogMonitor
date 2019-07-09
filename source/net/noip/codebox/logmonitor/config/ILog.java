package net.noip.codebox.logmonitor.config;

import java.util.List;
import java.util.regex.Pattern;

public interface ILog {
    public String getLocation();
    public String getName();
    public String getType();
    public IOptions getDefaultOptions();
    public List<IStyle> getDefaultStyles();
    public Pattern getFilter();
}
