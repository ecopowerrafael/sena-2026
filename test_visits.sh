#!/bin/bash
set -e

API="http://localhost:3333"
TOKEN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sena.local","password":"admin123"}' | jq -r '.data.accessToken')

echo "=== TEST 1: CREATE VISIT ==="
VISIT=$(curl -s -X POST "$API/visits" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId":"1",
    "clientId":"1",
    "scheduledAt":"2026-08-18T14:00:00Z",
    "durationMinutes":60
  }')

VISIT_ID=$(echo "$VISIT" | jq -r '.data.id // empty')
echo "Visit created: $VISIT_ID"
echo "$VISIT" | jq '.data | {id, status}'

echo ""
echo "=== TEST 2: GET VISIT (F5 simulation) ==="
VISIT_CHECK=$(curl -s -X GET "$API/visits/$VISIT_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "$VISIT_CHECK" | jq '.data | {id, status, scheduledAt}'

echo ""
echo "=== TEST 3: UPDATE VISIT FEEDBACK ==="
UPDATE=$(curl -s -X PATCH "$API/visits/$VISIT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "feedback":"Ótimo imóvel, cliente interessado",
    "impression":"POSITIVE",
    "status":"COMPLETED"
  }')
echo "$UPDATE" | jq '.data | {id, status, feedback, impression}'

echo ""
echo "=== TEST 4: GET VISIT (F5 confirmation) ==="
VISIT_FINAL=$(curl -s -X GET "$API/visits/$VISIT_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "$VISIT_FINAL" | jq '.data | {id, status, feedback, impression, scheduledAt}'

if [ "$(echo "$VISIT_FINAL" | jq -r '.data.status')" = "COMPLETED" ]; then
  echo "✓ VISIT F5 TEST PASSED"
else
  echo "✗ VISIT F5 TEST FAILED"
fi
