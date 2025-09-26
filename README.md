# Broke Guest Manager for OpenRCT2

A comprehensive OpenRCT2 plugin that helps manage guests who have run out of money or can't afford park attractions, with advanced park rating protection to prevent negative impacts on your park's reputation.

![OpenRCT2](https://img.shields.io/badge/OpenRCT2-Compatible-green)
![Version](https://img.shields.io/badge/version-12.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-yellow)

## 🎯 Features

### 🏠 Guest Management
- **Automatic Detection**: Identifies guests with $0 (broke) and guests who can't afford any rides
- **Custom Thresholds**: Set your own money threshold for guest management
- **Flexible Sending Options**: Choose between normal departure (guests walk to exit) or instant deletion
- **Separate Controls**: Different buttons for broke guests vs. guests who can't afford rides
- **Auto-Send Mode**: Automatically send qualifying guests home at regular intervals

### 📊 Smart Analytics
- **Real-Time Counters**: Track broke guests, guests who can't afford rides, and departure statistics
- **Currency Detection**: Automatically detects and displays your park's currency symbol
- **Accurate Tracking**: Prevents double-counting and provides reliable statistics
- **Configurable Updates**: Set your preferred stat update interval (5-300 seconds)

### 🛡️ Advanced Park Rating Protection
- **Multi-Layer Protection**: 5-tier rating protection system prevents rating drops from departing guests
- **Intelligent Happiness Management**: Automatically boosts departing guest happiness to offset rating penalties
- **Emergency Override**: Cheat mode activation for extreme scenarios (>50 departing guests)
- **Real-Time Monitoring**: Continuous protection with detailed console logging
- **API Resilience**: Works across different OpenRCT2 versions with multiple fallback mechanisms

### ⚙️ Advanced Configuration
- **Custom Money Thresholds**: Set specific cash amounts below which guests are considered for removal
- **Performance Optimization**: Configurable update intervals to balance accuracy vs. performance
- **Instant Delete Mode**: Option to instantly remove guests instead of making them walk to exit
- **Rating Protection Toggle**: Enable/disable park rating protection (on by default)

## 📦 Installation

1. **Download** the latest `broke-guest-manager-v12.js` file
2. **Place** it in your OpenRCT2 plugin directory:
   - **Windows**: `%USERPROFILE%\Documents\OpenRCT2\plugin\`
   - **macOS**: `~/Documents/OpenRCT2/plugin/`
   - **Linux**: `~/.config/OpenRCT2/plugin/`
3. **Restart** OpenRCT2 or reload plugins
4. **Access** via the "Broke Guest Manager v12" menu item

## 🚀 Quick Start

### Basic Usage
1. Open your park in OpenRCT2
2. Click "Broke Guest Manager v12" in the menu
3. The main window shows:
   - Current count of broke guests and guests who can't afford rides
   - Cheapest ride price (used as threshold)
   - Guest departure statistics

### Sending Guests Home
- **Send Broke**: Removes guests with $0
- **Send Cant Afford**: Removes guests who can't afford the cheapest ride
- **Send All**: Removes all qualifying guests
- **Advanced**: Opens detailed settings

### Advanced Settings
- **Custom Threshold**: Set a specific money amount instead of using cheapest ride price
- **Instant Delete**: Remove guests immediately vs. making them walk to exit
- **Rating Protection**: Enable/disable park rating protection (recommended: keep enabled)
- **Update Interval**: Configure how often statistics are updated

## 🛡️ Park Rating Protection

This plugin includes a sophisticated park rating protection system that prevents your park rating from dropping when guests leave:

### How It Works
1. **Pre-emptive Protection**: Guest happiness is boosted to maximum before they're sent home
2. **Continuous Monitoring**: All departing guests are continuously monitored and their happiness maintained
3. **Emergency Measures**: For large groups of departing guests, emergency cheat protection activates
4. **Multiple Safeguards**: Works even if some API functions are unavailable

### Console Messages
When rating protection is active, you'll see messages like:
```
Broke Guest Manager: Park rating protection enabled. Baseline: 967
Broke Guest Manager: Pre-boosted happiness for guest 1234 (rating protection)
Broke Guest Manager: Immediate rating protection activated
Broke Guest Manager: Boosted 15/20 leaving guests to max happiness
```

## 🔧 Advanced Features

### Custom Thresholds
Instead of using the cheapest ride price, you can set a custom money threshold:
1. Open **Advanced Settings**
2. Check **"Use custom threshold"**
3. Enter your desired amount (e.g., £10)
4. All guests below this amount will be considered for removal

### Auto-Send Mode
Enable automatic guest management:
1. Check **"Auto-send broke"** or **"Auto-send cant afford"**
2. The plugin will automatically send qualifying guests home every 5 seconds
3. Perfect for hands-off park management

### Performance Tuning
Adjust the stat update interval based on your preferences:
- **Lower values** (5-15s): More responsive but uses more CPU
- **Higher values** (30-60s): Less responsive but better performance
- **Default**: 30 seconds (good balance)

## 🐛 Debugging & Testing

### Debug Tools Included
The plugin comes with comprehensive debugging tools:

#### `debug-rating-protection.js`
Advanced debugging plugin with real-time monitoring window:
- API availability testing
- Live park rating tracking  
- Guest state monitoring
- Rating protection verification

#### `test-rating-protection.js`
Basic testing plugin for API validation:
- Park rating access testing
- Guest manipulation verification
- Console diagnostics

### Console Logging
Enable detailed console logging to monitor plugin operation:
- Guest sending operations
- Rating protection activities
- Error messages and fallbacks
- Performance metrics

### Common Issues & Solutions

**Rating protection not working:**
1. Load `debug-rating-protection.js` to diagnose API availability
2. Check console for "Park rating protection enabled" message
3. Verify guests are being happiness-boosted in the logs

**Plugin not appearing in menu:**
1. Ensure file is in correct plugin directory
2. Check file extension is `.js`
3. Restart OpenRCT2 completely
4. Check console for plugin loading errors

**Currency display issues:**
1. Plugin auto-detects currency symbols
2. Falls back to $ symbol if detection fails
3. Currency scaling is automatically detected

## 🔄 Version History

### v12.0.0 (Latest)
- ✅ **Fixed stat update interval display bug**
- ✅ **Complete park rating protection system overhaul**
- ✅ **Multi-layer rating protection with 5 different approaches**  
- ✅ **Enhanced debugging tools and diagnostics**
- ✅ **Improved API compatibility across OpenRCT2 versions**
- ✅ **Pre-emptive happiness boosting for departing guests**
- ✅ **Emergency cheat mode protection for mass departures**

### v11.0.0
- Added park rating protection system (later improved in v12)
- Enhanced UI with better text alignment
- Improved guest tracking accuracy

### v10.0.0
- Added custom threshold functionality
- Improved currency handling and display
- Enhanced batch processing for guest operations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup
1. Clone the repository
2. Edit the JavaScript files in your preferred editor
3. Test in OpenRCT2 by placing files in plugin directory
4. Submit pull requests with clear descriptions

### Testing
Always test changes with:
1. Different park scenarios (empty parks, crowded parks)
2. Various currency settings
3. Different guest count scenarios
4. Multiple OpenRCT2 versions if possible

## 📋 Requirements

- **OpenRCT2**: Latest stable version recommended
- **Game Mode**: Works in scenario and sandbox modes
- **Platform**: Windows, macOS, Linux
- **Cheats**: Optional (for emergency rating protection)

## ⚠️ Important Notes

### Performance Considerations
- Plugin performs guest scans every 30 seconds by default
- Instant delete mode is more performance-friendly than normal mode
- Large numbers of departing guests (>100) may cause brief lag during processing

### Rating Protection Disclaimer
- Rating protection works by manipulating guest happiness, not directly modifying park rating
- Emergency cheat mode requires cheats to be enabled in OpenRCT2
- Protection effectiveness may vary based on OpenRCT2 version and park conditions

### Save Game Compatibility
- Plugin state is not saved with your park
- Settings reset to defaults when plugin is reloaded
- No permanent changes are made to your save files

## 📜 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- OpenRCT2 development team for the excellent plugin API
- OpenRCT2 community for testing and feedback
- Contributors who helped improve the rating protection system

## 📞 Support

- **Issues**: Report bugs via GitHub Issues
- **Questions**: Ask in OpenRCT2 Discord or subreddit
- **Feature Requests**: Submit via GitHub Issues with enhancement label

---

**Made for OpenRCT2 with ❤️**
