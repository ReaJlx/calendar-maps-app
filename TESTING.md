# Calendar Maps App - Testing Guide

## Test Scenarios

### 1. Authentication Flow ✓
**Objective:** Verify OAuth login works correctly

**Steps:**
1. Navigate to http://localhost:3000
2. Click "Sign in with Google"
3. Authenticate with Google account
4. Should redirect to /dashboard
5. Verify user is authenticated

**Expected:** User can successfully login and access dashboard

### 2. Event Fetching ✓
**Objective:** Verify calendar events are fetched correctly

**Steps:**
1. Login to app
2. Navigate to /dashboard
3. Wait for events to load
4. Check browser console for errors
5. Verify event count matches

**Expected:** Events load without errors, count displays correctly

### 3. Location Filtering ✓
**Objective:** Verify only events with locations show

**Steps:**
1. Access dashboard
2. Verify "Events with locations" count
3. Check all displayed events have location field
4. Compare with Google Calendar

**Expected:** Only events with location addresses shown, count is accurate

### 4. Map Display ✓
**Objective:** Verify Google Map loads and displays markers

**Steps:**
1. Access dashboard
2. Wait for map to load
3. Verify map tiles load
4. Count markers on map
5. Verify marker count matches event count

**Expected:** Map loads with correct number of markers

### 5. Geocoding ✓
**Objective:** Verify address to coordinates conversion

**Steps:**
1. Add test event with location "Paris, France"
2. Load dashboard
3. Verify marker appears on map
4. Check marker is in Paris region
5. Test with various location formats

**Expected:** Addresses correctly converted to map coordinates

### 6. Info Windows ✓
**Objective:** Verify event details display in map popups

**Steps:**
1. Click on any marker on map
2. Verify info window appears
3. Check event title shows
4. Check location address shows
5. Check event time shows

**Expected:** All event info displays correctly in popup

### 7. Event List View ✓
**Objective:** Verify events display in list format

**Steps:**
1. Scroll down dashboard
2. See event list below map
3. Verify event cards show
4. Check title, location, time on each card
5. Verify list matches map markers

**Expected:** Event list shows all events with locations

### 8. Real-time Refresh ✓
**Objective:** Verify events refresh periodically

**Steps:**
1. Load dashboard
2. Add new event to Google Calendar with location
3. Wait 5+ minutes
4. Verify new event appears on map
5. Check event count increased

**Expected:** New events appear after refresh interval

### 9. Error Handling ✓
**Objective:** Verify graceful error handling

**Steps:**
1. Disconnect internet temporarily
2. Trigger event fetch
3. Verify error message displays
4. Verify map still displays
5. Check retry works when online

**Expected:** Errors display without breaking UI, retry works

### 10. Performance ✓
**Objective:** Verify app performs well with many events

**Steps:**
1. Load calendar with 50+ events
2. Monitor load time
3. Check memory usage
4. Test map interactions (pan, zoom)
5. Verify no lag in interactions

**Expected:** Events load in < 5 seconds, interactions smooth

## Manual Testing Checklist

- [ ] Login flow works
- [ ] Events fetch correctly
- [ ] Only events with locations show
- [ ] Map displays properly
- [ ] Markers appear on map
- [ ] Clicking markers shows event details
- [ ] Event list displays
- [ ] Geocoding works for various address formats
- [ ] Pagination works (if > 50 events)
- [ ] Mobile responsive design works
- [ ] Dark mode (if implemented) works
- [ ] Logout works and clears auth
- [ ] Session timeout works
- [ ] Keyboard navigation works
- [ ] Accessibility features work

## Automated Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Performance Benchmarks

### Target Metrics
- First Paint: < 2s
- Time to Interactive: < 3s
- Map Load: < 2s
- Event Fetch: < 2s
- Geocoding per address: < 1s

### Monitoring
- Monitor API response times
- Track geocoding cache hit rate
- Monitor map performance
- Track user interactions

## Bug Report Template

**Title:** [Component] Brief description

**Steps to Reproduce:**
1. ...
2. ...

**Expected:**
...

**Actual:**
...

**Environment:**
- Browser: ...
- OS: ...
- App Version: ...

**Screenshots:**
[Attach if applicable]

---

*Last Updated: Jan 29, 2025*
