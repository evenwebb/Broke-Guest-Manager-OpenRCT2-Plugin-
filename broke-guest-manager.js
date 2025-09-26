var main = function() {
    if (typeof ui === 'undefined') {
        console.log('Broke Guest Manager: UI not available');
        return;
    }

    var autoSendHome = false;
    var autoSendCantAfford = false;
    var brokeGuestWindow = null;
    var advancedWindow = null;
    var updateInterval = null;
    
    // Advanced settings
    var customMoneyThreshold = null; // null means use cheapest ride price
    var instantDelete = false;
    var statUpdateInterval = 30; // seconds between stat updates
    var protectParkRating = true; // ON BY DEFAULT - protect rating from leaving guests
    
    // Counter system
    var guestsActuallyLeft = 0;
    var guestsSentButStillWalking = {};
    var lastUpdateTime = 0;

    // Rating protection system
    var baselineParkRating = null;
    var ratingProtectionInterval = null;
    var ratingProtectionActive = false;
    var ratingMonitoringActive = false;

    function formatCurrency(amount) {
        try {
            return context.formatString('{CURRENCY}', amount);
        } catch (error) {
            return '$' + amount.toFixed(2);
        }
    }

    function getCurrencySymbol() {
        try {
            // Try to extract just the symbol from formatted currency
            var formatted = formatCurrency(0);
            return formatted.replace(/[\d.,\s]/g, ''); // Remove digits, dots, commas, spaces
        } catch (error) {
            return '$';
        }
    }

    // Determine currency scale by testing known values
    function getCurrencyScale() {
        // Test how much internal currency equals 1 display unit
        try {
            var testAmount = 10; // 10 internal units
            var formatted = formatCurrency(testAmount);
            
            // Extract just the numeric part
            var numericPart = formatted.replace(/[^\d.,]/g, '');
            var displayValue = parseFloat(numericPart);
            
            if (displayValue >= 0.9 && displayValue <= 1.1) {
                // 10 internal = ~1.00 display, so scale is 10
                return 10;
            } else if (displayValue >= 9 && displayValue <= 11) {
                // 10 internal = ~10 display, so scale is 1
                return 1;
            } else {
                // Default to 10 (most common)
                return 10;
            }
        } catch (error) {
            return 10; // Default
        }
    }

    var currencyScale = getCurrencyScale();

    // Park Rating Protection System - Enhanced Debug Version
    function initializeRatingProtection() {
        console.log('Broke Guest Manager: initializeRatingProtection called, protectParkRating=' + protectParkRating);
        
        if (protectParkRating && !ratingProtectionInterval) {
            // Debug all available objects
            console.log('Broke Guest Manager: Available objects check:');
            console.log('  - park exists: ' + (typeof park !== 'undefined'));
            console.log('  - context exists: ' + (typeof context !== 'undefined'));
            console.log('  - scenario exists: ' + (typeof scenario !== 'undefined'));
            
            // Store baseline rating when protection starts
            var parkRating = getParkRating();
            if (parkRating !== null) {
                baselineParkRating = parkRating;
                ratingProtectionActive = true;
                console.log('Broke Guest Manager: Park rating protection enabled. Baseline: ' + baselineParkRating);
                
                // Monitor and maintain park rating every 3 seconds
                ratingProtectionInterval = context.setInterval(function() {
                    maintainParkRating();
                }, 3000);
                
                console.log('Broke Guest Manager: Rating protection interval started');
            } else {
                console.log('Broke Guest Manager: Cannot enable rating protection - park rating not accessible');
                // Try alternative approach - use game actions or hooks
                tryAlternativeRatingProtection();
            }
        } else if (!protectParkRating && ratingProtectionInterval) {
            // Disable protection
            context.clearInterval(ratingProtectionInterval);
            ratingProtectionInterval = null;
            ratingProtectionActive = false;
            baselineParkRating = null;
            console.log('Broke Guest Manager: Park rating protection disabled');
        }
    }

    function getParkRating() {
        try {
            // Try different ways to access park rating with detailed logging
            if (typeof park !== 'undefined' && park) {
                console.log('Broke Guest Manager: park object available, checking rating...');
                if (typeof park.rating !== 'undefined') {
                    console.log('Broke Guest Manager: Found park.rating = ' + park.rating);
                    return park.rating;
                } else {
                    console.log('Broke Guest Manager: park.rating is undefined');
                }
            } else {
                console.log('Broke Guest Manager: park object not available');
            }
            
            if (typeof context !== 'undefined' && context && context.park) {
                console.log('Broke Guest Manager: context.park available, checking rating...');
                if (typeof context.park.rating !== 'undefined') {
                    console.log('Broke Guest Manager: Found context.park.rating = ' + context.park.rating);
                    return context.park.rating;
                } else {
                    console.log('Broke Guest Manager: context.park.rating is undefined');
                }
            } else {
                console.log('Broke Guest Manager: context.park not available');
            }
            
            // Try scenario context
            if (typeof scenario !== 'undefined' && scenario) {
                console.log('Broke Guest Manager: scenario object available, checking parkRating...');
                if (typeof scenario.parkRating !== 'undefined') {
                    console.log('Broke Guest Manager: Found scenario.parkRating = ' + scenario.parkRating);
                    return scenario.parkRating;
                } else {
                    console.log('Broke Guest Manager: scenario.parkRating is undefined');
                }
            } else {
                console.log('Broke Guest Manager: scenario object not available');
            }
            
            console.log('Broke Guest Manager: No park rating found through any method');
            return null;
        } catch (error) {
            console.log('Broke Guest Manager: Error accessing park rating: ' + error);
            return null;
        }
    }
    
    // Alternative rating protection using hooks and game actions
    function tryAlternativeRatingProtection() {
        console.log('Broke Guest Manager: Trying alternative rating protection methods...');
        
        try {
            // Approach 1: Use context.subscribe to monitor game events
            if (typeof context !== 'undefined' && context.subscribe) {
                console.log('Broke Guest Manager: Setting up event-based rating protection');
                
                // Monitor day intervals for rating checks
                context.subscribe("interval.day", function() {
                    if (protectParkRating) {
                        alternativeRatingCheck();
                    }
                });
                
                // Monitor guest generation events
                context.subscribe("guest.generation", function() {
                    if (protectParkRating) {
                        alternativeRatingCheck();
                    }
                });
                
                ratingProtectionActive = true;
                console.log('Broke Guest Manager: Alternative rating protection activated');
                return true;
            }
        } catch (error) {
            console.log('Broke Guest Manager: Alternative protection setup failed: ' + error);
        }
        
        // Approach 2: Periodic guest happiness boost without direct rating access
        try {
            console.log('Broke Guest Manager: Setting up happiness-based protection');
            ratingProtectionInterval = context.setInterval(function() {
                alternativeHappinessBoost();
            }, 5000); // Every 5 seconds
            
            ratingProtectionActive = true;
            console.log('Broke Guest Manager: Happiness-based protection activated');
            return true;
        } catch (error) {
            console.log('Broke Guest Manager: Happiness-based protection failed: ' + error);
        }
        
        return false;
    }
    
    // Simplified aggressive rating protection - runs every time we send guests
    function immediateRatingProtection() {
        if (!protectParkRating) return;
        
        try {
            console.log('Broke Guest Manager: Immediate rating protection activated');
            
            // Strategy 1: Boost ALL leaving guests to maximum happiness
            var allGuests = map.getAllEntities('guest');
            var leavingCount = 0;
            var boostedCount = 0;
            
            allGuests.forEach(function(guest) {
                try {
                    // Check if guest is leaving (either by flag or our tracking)
                    var isLeaving = false;
                    if (guest.getFlag) {
                        isLeaving = guest.getFlag('leavingPark') && guest.isInPark;
                    } else if (guestsSentButStillWalking[guest.id] && guest.isInPark) {
                        isLeaving = true;
                    }
                    
                    if (isLeaving) {
                        leavingCount++;
                        // Boost to maximum happiness (255) and other positive stats
                        if (guest.happiness < 255) {
                            guest.happiness = 255;
                            boostedCount++;
                        }
                        // Also boost energy, hunger, thirst if available
                        try {
                            if (typeof guest.energy !== 'undefined' && guest.energy < 200) {
                                guest.energy = 200;
                            }
                            if (typeof guest.hunger !== 'undefined' && guest.hunger > 50) {
                                guest.hunger = 50; // Lower is better for hunger
                            }
                            if (typeof guest.thirst !== 'undefined' && guest.thirst > 50) {
                                guest.thirst = 50; // Lower is better for thirst
                            }
                        } catch (error) {
                            // These properties might not exist in all versions
                        }
                    }
                } catch (error) {
                    // Skip this guest if there's an error
                }
            });
            
            if (boostedCount > 0) {
                console.log('Broke Guest Manager: Boosted ' + boostedCount + '/' + leavingCount + ' leaving guests to max happiness');
            }
            
            // Strategy 2: If we have a lot of leaving guests, try emergency measures
            if (leavingCount > 50) {
                console.log('Broke Guest Manager: Emergency rating protection for ' + leavingCount + ' leaving guests');
                
                // Try to use cheats if available
                try {
                    if (typeof cheats !== 'undefined' && cheats) {
                        var currentRating = getParkRating();
                        if (currentRating !== null) {
                            // Force rating to stay high
                            cheats.forcedParkRating = Math.max(999, currentRating);
                            console.log('Broke Guest Manager: Emergency cheat protection activated, rating forced to ' + cheats.forcedParkRating);
                        }
                    }
                } catch (error) {
                    console.log('Broke Guest Manager: Emergency cheat protection failed: ' + error);
                }
            }
            
        } catch (error) {
            console.log('Broke Guest Manager: Immediate rating protection error: ' + error);
        }
    }
    
    function alternativeRatingCheck() {
        try {
            // Boost happiness of all leaving guests as prevention
            var leavingGuests = map.getAllEntities('guest').filter(function(guest) {
                try {
                    if (guest.getFlag) {
                        return guest.getFlag('leavingPark') && guest.isInPark;
                    } else {
                        return guestsSentButStillWalking[guest.id] && guest.isInPark;
                    }
                } catch (error) {
                    return false;
                }
            });
            
            if (leavingGuests.length > 0) {
                console.log('Broke Guest Manager: Alternative protection - boosting ' + leavingGuests.length + ' leaving guests');
                leavingGuests.forEach(function(guest) {
                    try {
                        if (guest.happiness < 240) {
                            guest.happiness = 240;
                        }
                    } catch (error) {
                        // Ignore individual guest errors
                    }
                });
            }
        } catch (error) {
            console.log('Broke Guest Manager: Alternative rating check error: ' + error);
        }
    }
    
    function alternativeHappinessBoost() {
        try {
            // Always boost leaving guests to prevent rating drops
            var leavingGuests = map.getAllEntities('guest').filter(function(guest) {
                try {
                    if (guest.getFlag) {
                        return guest.getFlag('leavingPark') && guest.isInPark;
                    } else {
                        return guestsSentButStillWalking[guest.id] && guest.isInPark;
                    }
                } catch (error) {
                    return false;
                }
            });
            
            if (leavingGuests.length > 0) {
                var boosted = 0;
                leavingGuests.forEach(function(guest) {
                    try {
                        if (guest.happiness < 240) {
                            guest.happiness = 240;
                            boosted++;
                        }
                    } catch (error) {
                        // Continue with other guests
                    }
                });
                
                if (boosted > 0) {
                    console.log('Broke Guest Manager: Happiness protection - boosted ' + boosted + '/' + leavingGuests.length + ' leaving guests');
                }
            }
        } catch (error) {
            console.log('Broke Guest Manager: Alternative happiness boost error: ' + error);
        }
    }

    function maintainParkRating() {
        if (!ratingProtectionActive) {
            return;
        }

        try {
            var currentRating = getParkRating();
            if (currentRating === null) {
                return; // Can't protect if we can't read rating
            }
            var leavingGuests = map.getAllEntities('guest').filter(function(guest) {
                try {
                    // Try multiple ways to detect leaving guests
                    if (guest.getFlag) {
                        return guest.getFlag('leavingPark') && guest.isInPark;
                    } else {
                        // Fallback: check if guest is in our tracking but still in park
                        return guestsSentButStillWalking[guest.id] && guest.isInPark;
                    }
                } catch (error) {
                    return false;
                }
            });
            var leavingCount = leavingGuests.length;

            // Debug logging (only every 10th check to avoid spam)
            if (Math.random() < 0.1) {
                console.log('Broke Guest Manager: Rating check - Current: ' + currentRating + ', Baseline: ' + baselineParkRating + ', Leaving: ' + leavingCount);
            }

            // Calculate expected rating penalty from leaving guests
            // According to OpenRCT2 source: first 25 leaving guests = no penalty, then -7 per additional guest
            var expectedPenalty = leavingCount > 25 ? (leavingCount - 25) * 7 : 0;
            var tolerableRatingDrop = expectedPenalty + 20; // Allow some natural variation

            if (baselineParkRating !== null && currentRating < (baselineParkRating - tolerableRatingDrop)) {
                var ratingDeficit = baselineParkRating - currentRating;
                console.log('Broke Guest Manager: Rating protection triggered - ' + leavingCount + ' guests leaving, rating dropped ' + ratingDeficit + ' points');

                // Strategy 1: Boost happiness of leaving guests to offset penalty
                var guestsHappinessBoosted = 0;
                leavingGuests.forEach(function(guest) {
                    try {
                        if (guest.happiness < 240) {
                            guest.happiness = 240; // Make them very happy to offset rating penalty
                            guestsHappinessBoosted++;
                        }
                    } catch (error) {
                        // Guest happiness modification failed
                    }
                });

                if (guestsHappinessBoosted > 0) {
                    console.log('Broke Guest Manager: Boosted happiness for ' + guestsHappinessBoosted + ' leaving guests');
                }

                // Strategy 2: If severe drop, use forced rating (cheat mode)
                if (ratingDeficit > 100) {
                    try {
                        if (typeof cheats !== 'undefined' && cheats) {
                            console.log('Broke Guest Manager: Severe rating drop detected, activating emergency protection');
                            cheats.forcedParkRating = Math.max(baselineParkRating - 50, currentRating + 50);
                        } else {
                            console.log('Broke Guest Manager: Severe rating drop but cheats not available');
                        }
                    } catch (error) {
                        console.log('Broke Guest Manager: Failed to use cheat protection: ' + error);
                    }
                }
            }

            // Update baseline when no guests are leaving (allows rating to improve naturally)
            if (leavingCount === 0 && currentRating > baselineParkRating) {
                baselineParkRating = currentRating;
            }

        } catch (error) {
            console.log('Broke Guest Manager: Error in rating protection: ' + error);
        }
    }

    // Convert display currency (like £10) to internal currency units
    function displayToInternal(displayAmount) {
        return Math.round(displayAmount * currencyScale);
    }

    // Convert internal currency units to display currency (like £10)
    function internalToDisplay(internalAmount) {
        return internalAmount / currencyScale;
    }

    function getCheapestRidePrice() {
        var rides = map.rides.filter(function(ride) {
            return ride.classification === 'ride' && 
                   ride.status === 'open' && 
                   ride.price[0] > 0;
        });
        
        if (rides.length === 0) return 0;
        
        var cheapest = rides.reduce(function(min, ride) {
            return ride.price[0] < min.price[0] ? ride : min;
        });
        
        return cheapest.price[0];
    }

    function hasAnyPaidRides() {
        var rides = map.rides.filter(function(ride) {
            return ride.classification === 'ride' && 
                   ride.status === 'open' && 
                   ride.price[0] > 0;
        });
        return rides.length > 0;
    }

    function getMoneyThreshold() {
        if (customMoneyThreshold !== null) {
            return displayToInternal(customMoneyThreshold);
        }
        return getCheapestRidePrice();
    }

    function getBrokeGuests() {
        var allGuests = map.getAllEntities('guest');
        return allGuests.filter(function(guest) {
            return guest.cash <= 0 && guest.isInPark;
        });
    }

    function getCantAffordGuests() {
        var threshold = getMoneyThreshold();
        if (threshold === 0) return [];
        
        var allGuests = map.getAllEntities('guest');
        
        // When using custom threshold, include all guests below threshold
        if (customMoneyThreshold !== null) {
            var targetGuests = allGuests.filter(function(guest) {
                return guest.cash < threshold && guest.isInPark;
            });
            return targetGuests;
        } else {
            // Original logic: only guests with some money but can't afford rides
            return allGuests.filter(function(guest) {
                return guest.cash < threshold && guest.cash > 0 && guest.isInPark;
            });
        }
    }

    // Get guests already in leaving state for instant delete
    function getGuestsAlreadyLeaving() {
        var allGuests = map.getAllEntities('guest');
        var leavingGuests = [];
        
        allGuests.forEach(function(guest) {
            // Check if guest is in leaving state but still in park
            try {
                if (guest.getFlag && guest.getFlag('leavingPark') && guest.isInPark) {
                    leavingGuests.push(guest);
                }
            } catch (error) {
                // If getFlag doesn't work, check our tracking
                if (guestsSentButStillWalking[guest.id] && guest.isInPark) {
                    leavingGuests.push(guest);
                }
            }
        });
        
        return leavingGuests;
    }

    function getAllTargetGuests() {
        if (customMoneyThreshold !== null) {
            // Custom mode: all guests below threshold
            return getCantAffordGuests();
        } else {
            // Normal mode: broke guests + can't afford guests
            var brokeGuests = getBrokeGuests();
            var cantAffordGuests = getCantAffordGuests();
            
            // Combine and remove duplicates
            var allTargets = brokeGuests.concat(cantAffordGuests);
            var seen = {};
            return allTargets.filter(function(guest) {
                if (seen[guest.id]) return false;
                seen[guest.id] = true;
                return true;
            });
        }
    }

    function updateGuestDepartureTracking() {
        // Update based on configurable interval
        var currentTime = Date.now();
        if (currentTime - lastUpdateTime < (statUpdateInterval * 1000)) {
            return;
        }
        lastUpdateTime = currentTime;

        var currentGuestIds = map.getAllEntities('guest').map(function(g) { return g.id; });
        
        // Clean up tracking object - remove guests who are no longer in park
        for (var guestId in guestsSentButStillWalking) {
            if (currentGuestIds.indexOf(parseInt(guestId)) === -1) {
                // Guest left the park!
                guestsActuallyLeft++;
                delete guestsSentButStillWalking[guestId];
            }
        }
    }

    function sendGuestHome(guest) {
        try {
            if (instantDelete) {
                // Instant deletion - remove immediately, don't check if already sent
                guest.remove();
                guestsActuallyLeft++;
                
                // Clean up any existing tracking
                if (guestsSentButStillWalking[guest.id]) {
                    delete guestsSentButStillWalking[guest.id];
                }
                
                console.log('Broke Guest Manager: Instantly deleted guest ' + guest.id + ' (cash: ' + formatCurrency(guest.cash) + ')');
            } else {
                // Don't send the same guest multiple times in normal mode
                if (guestsSentButStillWalking[guest.id]) {
                    console.log('Broke Guest Manager: Guest ' + guest.id + ' already sent home, skipping');
                    return;
                }
                
                // RATING PROTECTION: Boost happiness BEFORE setting leaving flag
                if (protectParkRating) {
                    try {
                        if (guest.happiness < 240) {
                            guest.happiness = 240;
                            console.log('Broke Guest Manager: Pre-boosted happiness for guest ' + guest.id + ' (rating protection)');
                        }
                    } catch (error) {
                        console.log('Broke Guest Manager: Failed to boost guest happiness: ' + error);
                    }
                }
                
                // Normal send home - guest will walk to exit
                guest.setFlag('leavingPark', true);
                guestsSentButStillWalking[guest.id] = true;
                
                console.log('Broke Guest Manager: Sent guest ' + guest.id + ' home (cash: ' + formatCurrency(guest.cash) + ')' + 
                           (protectParkRating ? ' [rating protected]' : ''));
            }
        } catch (error) {
            console.log('Broke Guest Manager: Error sending guest home: ' + error);
        }
    }

    // Improved guest sending functions with better batch processing
    function sendBrokeGuestsHome() {
        var targetGuests = [];
        var sentCount = 0;
        
        if (customMoneyThreshold !== null) {
            // In custom mode, "Send Broke" sends all guests below threshold
            targetGuests = getCantAffordGuests();
            
            // If instant delete, also include guests already leaving
            if (instantDelete) {
                var leavingGuests = getGuestsAlreadyLeaving();
                targetGuests = targetGuests.concat(leavingGuests);
                
                // Remove duplicates
                var seen = {};
                targetGuests = targetGuests.filter(function(guest) {
                    if (seen[guest.id]) return false;
                    seen[guest.id] = true;
                    return true;
                });
            }
        } else {
            // Normal mode: only send $0 guests
            targetGuests = getBrokeGuests();
            
            // If instant delete, also include broke guests already leaving
            if (instantDelete) {
                var leavingGuests = getGuestsAlreadyLeaving().filter(function(guest) {
                    return guest.cash <= 0;
                });
                targetGuests = targetGuests.concat(leavingGuests);
                
                // Remove duplicates
                var seen = {};
                targetGuests = targetGuests.filter(function(guest) {
                    if (seen[guest.id]) return false;
                    seen[guest.id] = true;
                    return true;
                });
            }
        }
        
        // Process all guests in one batch to avoid filtering issues
        console.log('Broke Guest Manager: Processing ' + targetGuests.length + ' target guests for sending home');
        
        targetGuests.forEach(function(guest) {
            if (instantDelete || !guestsSentButStillWalking[guest.id]) {
                sendGuestHome(guest);
                sentCount++;
            }
        });
        
        // Trigger immediate rating protection after sending guests
        if (sentCount > 0) {
            immediateRatingProtection();
        }
        
        console.log('Broke Guest Manager: Sent ' + sentCount + ' guests home (' + targetGuests.length + ' total target guests found)');
    }

    function sendCantAffordGuestsHome() {
        var targetGuests = getCantAffordGuests();
        var threshold = getMoneyThreshold();
        var sentCount = 0;
        
        // If instant delete, also include guests already leaving who can't afford
        if (instantDelete) {
            var leavingGuests = getGuestsAlreadyLeaving().filter(function(guest) {
                return guest.cash < threshold && guest.cash >= 0;
            });
            targetGuests = targetGuests.concat(leavingGuests);
            
            // Remove duplicates
            var seen = {};
            targetGuests = targetGuests.filter(function(guest) {
                if (seen[guest.id]) return false;
                seen[guest.id] = true;
                return true;
            });
        }
        
        console.log('Broke Guest Manager: Using threshold ' + formatCurrency(threshold) + ', processing ' + targetGuests.length + ' guests below threshold');
        
        // Process all guests in one batch
        targetGuests.forEach(function(guest) {
            if (instantDelete || !guestsSentButStillWalking[guest.id]) {
                sendGuestHome(guest);
                sentCount++;
            }
        });
        
        // Trigger immediate rating protection after sending guests
        if (sentCount > 0) {
            immediateRatingProtection();
        }
        
        console.log('Broke Guest Manager: Sent ' + sentCount + ' guests below threshold home (' + targetGuests.length + ' total found)');
    }

    function sendAllTargetGuestsHome() {
        var targetGuests = getAllTargetGuests();
        var sentCount = 0;
        
        // If instant delete, also include all guests already leaving
        if (instantDelete) {
            var leavingGuests = getGuestsAlreadyLeaving();
            targetGuests = targetGuests.concat(leavingGuests);
            
            // Remove duplicates
            var seen = {};
            targetGuests = targetGuests.filter(function(guest) {
                if (seen[guest.id]) return false;
                seen[guest.id] = true;
                return true;
            });
        }
        
        console.log('Broke Guest Manager: Processing ' + targetGuests.length + ' total target guests');
        
        // Process all guests in one batch
        targetGuests.forEach(function(guest) {
            if (instantDelete || !guestsSentButStillWalking[guest.id]) {
                sendGuestHome(guest);
                sentCount++;
            }
        });
        
        // Trigger immediate rating protection after sending guests
        if (sentCount > 0) {
            immediateRatingProtection();
        }
        
        if (customMoneyThreshold !== null) {
            console.log('Broke Guest Manager: Sent ' + sentCount + ' guests below custom threshold of ' + formatCurrency(displayToInternal(customMoneyThreshold)));
        } else {
            console.log('Broke Guest Manager: Sent ' + sentCount + ' total target guests home');
        }
    }

    function resetCounter() {
        guestsActuallyLeft = 0;
        guestsSentButStillWalking = {};
        lastUpdateTime = 0;
        
        // Reset rating protection baseline
        if (protectParkRating) {
            var currentRating = getParkRating();
            if (currentRating !== null) {
                baselineParkRating = currentRating;
                console.log('Broke Guest Manager: Counter reset, rating baseline updated to ' + baselineParkRating);
            } else {
                console.log('Broke Guest Manager: Counter reset but could not update rating baseline');
            }
        } else {
            console.log('Broke Guest Manager: Counter reset');
        }
    }

    function getStillWalkingCount() {
        var count = 0;
        for (var id in guestsSentButStillWalking) {
            count++;
        }
        return count;
    }

    function createAdvancedWindow() {
        if (advancedWindow) {
            advancedWindow.close();
        }

        advancedWindow = ui.openWindow({
            classification: 'broke-guest-advanced-v12',
            title: 'Advanced Settings',
            width: 320,
            height: 200,
            widgets: [
                {
                    type: 'checkbox',
                    name: 'useCustomThresholdCheckbox',
                    x: 10,
                    y: 20,
                    width: 200,
                    height: 15,
                    text: 'Use custom threshold',
                    isChecked: customMoneyThreshold !== null,
                    onChange: function(isChecked) {
                        if (isChecked) {
                            customMoneyThreshold = Math.max(10, internalToDisplay(getCheapestRidePrice() || 100));
                        } else {
                            customMoneyThreshold = null;
                        }
                        updateAdvancedDisplay();
                        updateBrokeGuestDisplay();
                    }
                },
                {
                    type: 'label',
                    name: 'currencySymbolLabel',
                    x: 10,
                    y: 48,
                    width: 20,
                    height: 15,
                    text: getCurrencySymbol()
                },
                {
                    type: 'textbox',
                    name: 'thresholdTextbox',
                    x: 25,
                    y: 45,
                    width: 80,
                    height: 20,
                    text: customMoneyThreshold !== null ? Math.round(customMoneyThreshold).toString() : '0',
                    onChange: function(text) {
                        if (customMoneyThreshold !== null) {
                            var value = parseInt(text);
                            if (!isNaN(value) && value >= 0) {
                                customMoneyThreshold = value;
                                updateAdvancedDisplay();
                                updateBrokeGuestDisplay();
                            }
                        }
                    }
                },
                {
                    type: 'button',
                    name: 'thresholdUpButton',
                    x: 110,
                    y: 45,
                    width: 20,
                    height: 20,
                    text: '+',
                    onClick: function() {
                        if (customMoneyThreshold !== null) {
                            customMoneyThreshold = Math.max(0, customMoneyThreshold + 1);
                            updateAdvancedDisplay();
                            updateBrokeGuestDisplay();
                        }
                    }
                },
                {
                    type: 'button',
                    name: 'thresholdDownButton',
                    x: 135,
                    y: 45,
                    width: 20,
                    height: 20,
                    text: '-',
                    onClick: function() {
                        if (customMoneyThreshold !== null) {
                            customMoneyThreshold = Math.max(0, customMoneyThreshold - 1);
                            updateAdvancedDisplay();
                            updateBrokeGuestDisplay();
                        }
                    }
                },
                {
                    type: 'checkbox',
                    name: 'instantDeleteCheckbox',
                    x: 10,
                    y: 75,
                    width: 300,
                    height: 15,
                    text: 'Instant delete (includes guests already leaving)',
                    isChecked: instantDelete,
                    onChange: function(isChecked) {
                        instantDelete = isChecked;
                        updateAdvancedDisplay();
                    }
                },
                {
                    type: 'checkbox',
                    name: 'protectRatingCheckbox',
                    x: 10,
                    y: 95,
                    width: 280,
                    height: 15,
                    text: 'Protect park rating from leaving guests (recommended)',
                    isChecked: protectParkRating,
                    onChange: function(isChecked) {
                        protectParkRating = isChecked;
                        initializeRatingProtection();
                        updateAdvancedDisplay();
                    }
                },
                {
                    type: 'label',
                    name: 'updateIntervalLabel',
                    x: 10,
                    y: 120,
                    width: 150,
                    height: 15,
                    text: 'Stat update interval (seconds):'
                },
                {
                    type: 'textbox',
                    name: 'updateIntervalTextbox',
                    x: 170,
                    y: 120,
                    width: 50,
                    height: 15,
                    text: statUpdateInterval.toString(),
                    onChange: function(text) {
                        var value = parseInt(text);
                        if (!isNaN(value) && value >= 5 && value <= 300) {
                            statUpdateInterval = value;
                            updateAdvancedDisplay();
                            updateBrokeGuestDisplay(); // Update main window to show new interval
                        }
                    }
                },
                {
                    type: 'label',
                    name: 'warningLabel',
                    x: 10,
                    y: 145,
                    width: 300,
                    height: 15,
                    text: instantDelete ? 'WARNING: Guests will be deleted instantly!' : 'Normal mode: Guests walk to exit'
                },
                {
                    type: 'button',
                    name: 'closeAdvancedButton',
                    x: 10,
                    y: 170,
                    width: 80,
                    height: 20,
                    text: 'Close',
                    onClick: function() {
                        advancedWindow.close();
                        advancedWindow = null;
                    }
                }
            ],
            onClose: function() {
                advancedWindow = null;
            }
        });

        updateAdvancedDisplay();
    }

    function updateAdvancedDisplay() {
        if (!advancedWindow) return;
        
        // Update currency symbol
        advancedWindow.findWidget('currencySymbolLabel').text = getCurrencySymbol();
        
        // Update textbox with rounded whole number
        var textbox = advancedWindow.findWidget('thresholdTextbox');
        var upButton = advancedWindow.findWidget('thresholdUpButton');
        var downButton = advancedWindow.findWidget('thresholdDownButton');
        
        if (customMoneyThreshold !== null) {
            textbox.text = Math.round(customMoneyThreshold).toString();
            textbox.isDisabled = false;
            upButton.isDisabled = false;
            downButton.isDisabled = false;
        } else {
            textbox.text = '0';
            textbox.isDisabled = true;
            upButton.isDisabled = true;
            downButton.isDisabled = true;
        }
        
        var warningText = instantDelete ? 
            'WARNING: Guests will be deleted instantly!' : 
            'Normal mode: Guests walk to exit';
        advancedWindow.findWidget('warningLabel').text = warningText;
        
        // Update interval textbox
        advancedWindow.findWidget('updateIntervalTextbox').text = statUpdateInterval.toString();
    }

    function createBrokeGuestWindow() {
        if (brokeGuestWindow) {
            brokeGuestWindow.close();
        }

        brokeGuestWindow = ui.openWindow({
            classification: 'broke-guest-manager-v12',
            title: 'Broke Guest Manager',
            width: 380,
            height: 170,
            widgets: [
                {
                    type: 'label',
                    name: 'brokeCountLabel',
                    x: 10,
                    y: 20,
                    width: 360,
                    height: 15,
                    text: 'Loading...'
                },
                {
                    type: 'label',
                    name: 'cheapestRideLabel',
                    x: 10,
                    y: 35,
                    width: 360,
                    height: 15,
                    text: 'Threshold: Loading...'
                },
                {
                    type: 'label',
                    name: 'sentCounterLabel',
                    x: 10,
                    y: 50,
                    width: 360,
                    height: 15,
                    text: 'Guests who left park: 0'
                },
                {
                    type: 'button',
                    name: 'sendBrokeButton',
                    x: 10,
                    y: 75,
                    width: 90,
                    height: 25,
                    text: customMoneyThreshold !== null ? 'Send Below' : 'Send Broke',
                    onClick: function() {
                        sendBrokeGuestsHome();
                        updateBrokeGuestDisplay();
                    }
                },
                {
                    type: 'button',
                    name: 'sendCantAffordButton',
                    x: 110,
                    y: 75,
                    width: 100,
                    height: 25,
                    text: customMoneyThreshold !== null ? 'Send Below Limit' : 'Send Cant Afford',
                    onClick: function() {
                        sendCantAffordGuestsHome();
                        updateBrokeGuestDisplay();
                    }
                },
                {
                    type: 'button',
                    name: 'sendAllButton',
                    x: 220,
                    y: 75,
                    width: 70,
                    height: 25,
                    text: 'Send All',
                    onClick: function() {
                        sendAllTargetGuestsHome();
                        updateBrokeGuestDisplay();
                    }
                },
                {
                    type: 'button',
                    name: 'advancedButton',
                    x: 300,
                    y: 75,
                    width: 70,
                    height: 25,
                    text: 'Advanced',
                    onClick: function() {
                        createAdvancedWindow();
                    }
                },
                {
                    type: 'button',
                    name: 'refreshButton',
                    x: 10,
                    y: 110,
                    width: 60,
                    height: 20,
                    text: 'Refresh',
                    onClick: function() {
                        updateBrokeGuestDisplay();
                    }
                },
                {
                    type: 'button',
                    name: 'resetCounterButton',
                    x: 80,
                    y: 110,
                    width: 80,
                    height: 20,
                    text: 'Reset Counter',
                    onClick: function() {
                        resetCounter();
                        updateBrokeGuestDisplay();
                    }
                },
                {
                    type: 'checkbox',
                    name: 'autoSendCheckbox',
                    x: 10,
                    y: 140,
                    width: 130,
                    height: 15,
                    text: customMoneyThreshold !== null ? 'Auto-send below' : 'Auto-send broke',
                    isChecked: autoSendHome,
                    onChange: function(isChecked) {
                        autoSendHome = isChecked;
                        updateAutoSend();
                    }
                },
                {
                    type: 'checkbox',
                    name: 'autoSendCantAffordCheckbox',
                    x: 150,
                    y: 140,
                    width: 150,
                    height: 15,
                    text: customMoneyThreshold !== null ? 'Auto-send below limit' : 'Auto-send cant afford',
                    isChecked: autoSendCantAfford,
                    onChange: function(isChecked) {
                        autoSendCantAfford = isChecked;
                        updateAutoSend();
                    }
                }
            ],
            onClose: function() {
                if (updateInterval) {
                    context.clearInterval(updateInterval);
                    updateInterval = null;
                }
                if (ratingProtectionInterval) {
                    context.clearInterval(ratingProtectionInterval);
                    ratingProtectionInterval = null;
                }
                if (advancedWindow) {
                    advancedWindow.close();
                    advancedWindow = null;
                }
                brokeGuestWindow = null;
            }
        });
        
        // Initialize rating protection
        initializeRatingProtection();
        
        updateBrokeGuestDisplay();
    }

    function updateAutoSend() {
        if ((autoSendHome || autoSendCantAfford) && !updateInterval) {
            updateInterval = context.setInterval(function() {
                var didSend = false;
                
                if (customMoneyThreshold !== null) {
                    // Custom threshold mode: both checkboxes do the same thing
                    if (autoSendHome || autoSendCantAfford) {
                        var targetGuests = getCantAffordGuests();
                        if (targetGuests.length > 0) {
                            targetGuests.forEach(function(guest) {
                                if (instantDelete || !guestsSentButStillWalking[guest.id]) {
                                    sendGuestHome(guest);
                                }
                            });
                            didSend = true;
                        }
                    }
                } else {
                    // Normal mode: separate broke and can't afford
                    if (autoSendHome) {
                        var brokeGuests = getBrokeGuests();
                        if (brokeGuests.length > 0) {
                            brokeGuests.forEach(function(guest) {
                                if (instantDelete || !guestsSentButStillWalking[guest.id]) {
                                    sendGuestHome(guest);
                                }
                            });
                            didSend = true;
                        }
                    }
                    if (autoSendCantAfford) {
                        var cantAffordGuests = getCantAffordGuests();
                        if (cantAffordGuests.length > 0) {
                            cantAffordGuests.forEach(function(guest) {
                                if (instantDelete || !guestsSentButStillWalking[guest.id]) {
                                    sendGuestHome(guest);
                                }
                            });
                            didSend = true;
                        }
                    }
                }
                
                if (didSend) {
                    updateBrokeGuestDisplay();
                }
            }, 5000);
        } else if (!autoSendHome && !autoSendCantAfford && updateInterval) {
            context.clearInterval(updateInterval);
            updateInterval = null;
        }
    }

    function updateBrokeGuestDisplay() {
        if (!brokeGuestWindow) return;

        // Update departure tracking based on configurable interval
        updateGuestDepartureTracking();

        var brokeGuests = getBrokeGuests();
        var cantAffordGuests = getCantAffordGuests();
        var threshold = getMoneyThreshold();
        var hasPaidRides = hasAnyPaidRides();
        
        // Also show guests already leaving when instant delete is enabled
        var leavingGuestsCount = instantDelete ? getGuestsAlreadyLeaving().length : 0;
        
        var countText;
        if (customMoneyThreshold !== null) {
            countText = 'Guests below ' + formatCurrency(displayToInternal(customMoneyThreshold)) + ': ' + cantAffordGuests.length;
            if (instantDelete && leavingGuestsCount > 0) {
                countText += ' (+ ' + leavingGuestsCount + ' already leaving)';
            }
        } else {
            countText = 'Broke guests: ' + brokeGuests.length;
            if (cantAffordGuests.length > 0) {
                countText += ' | Cant afford: ' + cantAffordGuests.length;
            }
            if (instantDelete && leavingGuestsCount > 0) {
                countText += ' (+ ' + leavingGuestsCount + ' already leaving)';
            }
        }
        
        var thresholdText;
        if (customMoneyThreshold !== null) {
            thresholdText = 'Custom threshold: ' + formatCurrency(displayToInternal(customMoneyThreshold));
        } else if (threshold > 0) {
            thresholdText = 'Cheapest ride: ' + formatCurrency(threshold);
        } else {
            thresholdText = 'All rides are free';
        }
        
        // Counter display
        var stillWalkingCount = getStillWalkingCount();
        var sentText = 'Guests who left park: ' + guestsActuallyLeft;
        if (stillWalkingCount > 0) {
            sentText += ' (+ ' + stillWalkingCount + ' walking out)';
        }
        if (instantDelete) {
            sentText += ' [instant mode]';
        }
        if (protectParkRating && stillWalkingCount > 0) {
            sentText += ' [rating protected]';
        }
        sentText += ' (updates every ' + statUpdateInterval + 's)';
        
        brokeGuestWindow.findWidget('brokeCountLabel').text = countText;
        brokeGuestWindow.findWidget('cheapestRideLabel').text = thresholdText;
        brokeGuestWindow.findWidget('sentCounterLabel').text = sentText;

        // Update button text and behavior based on mode
        var sendBrokeButton = brokeGuestWindow.findWidget('sendBrokeButton');
        var cantAffordButton = brokeGuestWindow.findWidget('sendCantAffordButton');
        var brokeCheckbox = brokeGuestWindow.findWidget('autoSendCheckbox');
        var cantAffordCheckbox = brokeGuestWindow.findWidget('autoSendCantAffordCheckbox');
        
        if (customMoneyThreshold !== null) {
            // Custom threshold mode: both buttons do essentially the same thing
            sendBrokeButton.text = 'Send Below';
            cantAffordButton.text = 'Send Below Limit';
            brokeCheckbox.text = 'Auto-send below';
            cantAffordCheckbox.text = 'Auto-send below limit';
            
            // Both buttons are enabled in custom mode
            cantAffordButton.isDisabled = false;
            cantAffordCheckbox.isDisabled = false;
        } else {
            // Normal mode: separate functions
            sendBrokeButton.text = 'Send Broke';
            cantAffordButton.text = 'Send Cant Afford';
            brokeCheckbox.text = 'Auto-send broke';
            cantAffordCheckbox.text = 'Auto-send cant afford';
            
            // Grey out can't afford controls when all rides are free
            var shouldDisable = !hasPaidRides;
            cantAffordButton.isDisabled = shouldDisable;
            cantAffordCheckbox.isDisabled = shouldDisable;
            
            if (shouldDisable && autoSendCantAfford) {
                autoSendCantAfford = false;
                cantAffordCheckbox.isChecked = false;
                updateAutoSend();
            }
        }
        
        // Update advanced window if open
        updateAdvancedDisplay();
    }

    ui.registerMenuItem('Broke Guest Manager', function() {
        createBrokeGuestWindow();
    });

    console.log('Broke Guest Manager plugin loaded successfully');
};

registerPlugin({
    name: 'Broke Guest Manager',
    version: '12.0.0',
    authors: ['Assistant'],
    type: 'local',
    licence: 'MIT',
    description: 'Enhanced with working park rating protection system that prevents rating drops from guests leaving the park',
    main: main
});