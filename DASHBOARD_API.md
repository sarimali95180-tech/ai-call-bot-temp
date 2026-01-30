# Dashboard Charts API Documentation

## Overview
The Dashboard Charts API provides comprehensive analytics about calls, including state-wise statistics and date-based insights (daily, weekly, and monthly).

---

## Endpoints

### 1. Get Dashboard Charts (Main Endpoint)
**Endpoint:** `GET /api/dashboard/charts`

**Description:** Returns all dashboard analytics including state-wise calls, daily, weekly, and monthly call totals.

**Response Format:**
```json
{
  "success": true,
  "message": "Dashboard charts data retrieved successfully",
  "data": {
    "stateWiseCalls": [
      {
        "state": "Alabama",
        "totalCalls": 1200
      },
      {
        "state": "Texas",
        "totalCalls": 123
      },
      ...
    ],
    "totalCallsAllStates": 5000,
    "dailyCalls": [
      {
        "date": "2026-01-20",
        "totalCalls": 150
      },
      {
        "date": "2026-01-21",
        "totalCalls": 175
      },
      ...
    ],
    "weeklyCalls": [
      {
        "weekStart": "2026-01-20",
        "totalCalls": 1050
      },
      {
        "weekStart": "2026-01-27",
        "totalCalls": 980
      },
      ...
    ],
    "monthlyCalls": [
      {
        "month": "2025-12",
        "totalCalls": 4200
      },
      {
        "month": "2026-01",
        "totalCalls": 5000
      },
      ...
    ],
    "summary": {
      "totalCalls": 5000,
      "statesCount": 45,
      "lastUpdated": "2026-01-26T10:30:00.000Z"
    }
  }
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/dashboard/charts" \
  -H "Content-Type: application/json"
```

---

### 2. Get Calls by Specific State
**Endpoint:** `GET /api/dashboard/state/:state`

**Description:** Returns all calls from a specific state with detailed information.

**Parameters:**
- `state` (string, required) - State name (e.g., "Alabama", "Texas")

**Query Parameters:**
- None

**Response Format:**
```json
{
  "success": true,
  "message": "Calls from Alabama retrieved successfully",
  "data": {
    "state": "Alabama",
    "totalCalls": 1200,
    "calls": [
      {
        "call_id": "call_123",
        "caller_number": "+1234567890",
        "call_start_time": "2026-01-26T10:30:00.000Z",
        "call_duration": 300,
        "customer_state": "Alabama"
      },
      ...
    ]
  }
}
```

**CURL Example:**
```bash
curl -X GET "http://localhost:5000/api/dashboard/state/Alabama" \
  -H "Content-Type: application/json"
```

---

## CURL Examples

### Example 1: Get all dashboard charts data
```bash
curl -X GET "http://localhost:5000/api/dashboard/charts" \
  -H "Content-Type: application/json"
```

### Example 2: Get calls from Texas
```bash
curl -X GET "http://localhost:5000/api/dashboard/state/Texas" \
  -H "Content-Type: application/json"
```

### Example 3: Get calls from California
```bash
curl -X GET "http://localhost:5000/api/dashboard/state/California" \
  -H "Content-Type: application/json"
```

### Example 4: Get calls from New York with formatted output
```bash
curl -X GET "http://localhost:5000/api/dashboard/state/New%20York" \
  -H "Content-Type: application/json" | jq '.'
```

---

## Features

### State-Wise Calls Analytics
- Displays total calls for each state
- Sorted by call count in descending order
- Returns state name and total call count

### Date-Based Analytics

#### Daily Calls (Last 7 Days)
- Shows call count for each day
- Useful for tracking daily performance
- Sorted chronologically

#### Weekly Calls (Last 4 Weeks)
- Aggregates calls by week
- Shows week start date and total calls
- Helps identify weekly trends

#### Monthly Calls (Last 12 Months)
- Aggregates calls by month (YYYY-MM format)
- Shows monthly call distribution
- Useful for long-term trend analysis

### Summary Statistics
- Total calls across all states
- Total number of states with calls
- Last update timestamp

---

## Usage Examples

### Frontend Integration (JavaScript/TypeScript)

```javascript
// Get dashboard charts data
async function fetchDashboardCharts() {
  try {
    const response = await fetch('http://localhost:5000/api/dashboard/charts');
    const result = await response.json();
    
    if (result.success) {
      console.log('State-wise calls:', result.data.stateWiseCalls);
      console.log('Daily calls:', result.data.dailyCalls);
      console.log('Weekly calls:', result.data.weeklyCalls);
      console.log('Monthly calls:', result.data.monthlyCalls);
      console.log('Summary:', result.data.summary);
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
}

// Get calls from specific state
async function fetchCallsByState(state) {
  try {
    const response = await fetch(`http://localhost:5000/api/dashboard/state/${state}`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`Calls from ${state}:`, result.data.calls);
    }
  } catch (error) {
    console.error('Error fetching state calls:', error);
  }
}

// Usage
fetchDashboardCharts();
fetchCallsByState('Alabama');
```

---

## Error Handling

### Possible Error Responses

**Invalid State Parameter:**
```json
{
  "success": false,
  "message": "State parameter is required"
}
```

**Server Error:**
```json
{
  "success": false,
  "message": "Failed to retrieve dashboard charts data"
}
```

---

## Performance Notes

- State-wise calls are sorted by count (descending)
- Daily calls show last 7 days only
- Weekly calls show last 4 weeks only
- Monthly calls show last 12 months only
- Limit of 100 calls per state in the state-specific endpoint

---

## Database Requirements

Ensure the `calls` table has the following fields:
- `call_id` - Unique call identifier
- `call_start_time` - Call start timestamp
- `customer_state` - State of the customer
- `caller_number` - Phone number (optional)
- `call_duration` - Duration in seconds (optional)

---

## Testing the API

### Using Postman
1. Create a new GET request
2. URL: `http://localhost:5000/api/dashboard/charts`
3. Click Send

### Using PowerShell
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/dashboard/charts" `
  -Method Get `
  -ContentType "application/json"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Using Thunder Client (VS Code Extension)
- Create new request
- Method: GET
- URL: http://localhost:5000/api/dashboard/charts
- Send

---

## API Availability
- **Base URL:** http://localhost:5000
- **Version:** 1.0
- **Authentication:** No authentication required
- **Rate Limiting:** None (to be implemented)
