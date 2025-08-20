         1 +  # Invite Partner Card Dismissal Implementation Plan
         2 +
         3 +  ## 🎯 **Objective**
         4 +  Make the invite partner card show only until dismissed once, then remain accessible through the top-right
           + navigation dropdown.
         5 +
         6 +  ## 📋 **Current State Analysis**
         7 +
         8 +  ### **Current Issues:**
         9 +  1. **InvitePrompt** (`src/components/ui/invitePrompt.tsx:11-14`) - Uses `useState` for dismissal
        10 +     - ❌ Dismissal state only persists during session
        11 +     - ❌ Card reappears on page refresh
        12 +     - ❌ No backend persistence
        13 +
        14 +  2. **ProfileDropdown** (`src/components/layout/profileDropdown.tsx:48-52`) - Already has invite functionality
        15 +     - ✅ "Invite Partner" option exists in dropdown
        16 +     - ✅ Opens same InvitePartnerModal
        17 +     - ✅ Only shows when user has account
        18 +
        19 +  ### **Current Flow:**
        20 +  ```
        21 +  User sees card → Clicks X → Card disappears (session only) → Page refresh → Card reappears
        22 +  ```
        23 +
        24 +  ### **Desired Flow:**
        25 +  ```
        26 +  User sees card → Clicks X → Card disappears forever → Access via Profile dropdown only
        27 +  ```
        28 +
        29 +  ## 🏗️ **Implementation Plan**
        30 +
        31 +  ### **Phase 1: Backend Changes**
        32 +
        33 +  #### **1.1 Database Schema Update**
        34 +  ```sql
        35 +  -- Add column to User table
        36 +  ALTER TABLE Users ADD COLUMN InvitePromptDismissed BOOLEAN DEFAULT FALSE;
        37 +  ```
        38 +
        39 +  #### **1.2 API Endpoint Creation**
        40 +  **File:** `PersonifiBackend/src/PersonifiBackend.Api/Controllers/UserPreferencesController.cs`
        41 +  ```csharp
        42 +  [ApiController]
        43 +  [Route("api/[controller]")]
        44 +  public class UserPreferencesController : ControllerBase
        45 +  {
        46 +      [HttpPost("dismiss-invite-prompt")]
        47 +      public async Task<IActionResult> DismissInvitePrompt()
        48 +      {
        49 +          // Mark InvitePromptDismissed = true for current user
        50 +          // Return success response
        51 +      }
        52 +
        53 +      [HttpGet("invite-prompt-status")]
        54 +      public async Task<IActionResult> GetInvitePromptStatus()
        55 +      {
        56 +          // Return { "dismissed": boolean }
        57 +      }
        58 +  }
        59 +  ```
        60 +
        61 +  #### **1.3 Service Layer Update**
        62 +  **File:** `PersonifiBackend/src/PersonifiBackend.Application/Services/UserPreferencesService.cs`
        63 +  ```csharp
        64 +  public interface IUserPreferencesService
        65 +  {
        66 +      Task<bool> DismissInvitePromptAsync(string userId);
        67 +      Task<bool> IsInvitePromptDismissedAsync(string userId);
        68 +  }
        69 +
        70 +  public class UserPreferencesService : IUserPreferencesService
        71 +  {
        72 +      // Implementation with EF Core repository
        73 +  }
        74 +  ```
        75 +
        76 +  ### **Phase 2: Frontend API Integration**
        77 +
        78 +  #### **2.1 API Client Functions**
        79 +  **File:** `src/lib/api/userPreferencesApi.ts`
        80 +  ```typescript
        81 +  export async function dismissInvitePrompt(): Promise<void> {
        82 +      const accessToken = await getAccessToken();
        83 +      const response = await fetch(`${API_BASE_URL}/api/UserPreferences/dismiss-invite-prompt`, {
        84 +          method: 'POST',
        85 +          headers: {
        86 +              'Authorization': `Bearer ${accessToken}`,
        87 +              'Content-Type': 'application/json',
        88 +          },
        89 +      });
        90 +
        91 +      if (!response.ok) {
        92 +          throw new Error('Failed to dismiss invite prompt');
        93 +      }
        94 +  }
        95 +
        96 +  export async function getInvitePromptStatus(): Promise<{ dismissed: boolean }> {
        97 +      const accessToken = await getAccessToken();
        98 +      const response = await fetch(`${API_BASE_URL}/api/UserPreferences/invite-prompt-status`, {
        99 +          method: 'GET',
       100 +          headers: {
       101 +              'Authorization': `Bearer ${accessToken}`,
       102 +          },
       103 +      });
       104 +
       105 +      if (!response.ok) {
       106 +          throw new Error('Failed to get invite prompt status');
       107 +      }
       108 +
       109 +      return await response.json();
       110 +  }
       111 +  ```
       112 +
       113 +  ### **Phase 3: Component Updates**
       114 +
       115 +  #### **3.1 Update InvitePrompt Component**
       116 +  **File:** `src/components/ui/invitePrompt.tsx`
       117 +
       118 +  **Current Implementation Issues:**
       119 +  - Lines 10-15: Uses local state only
       120 +  - Line 30: Dismissal not persisted
       121 +
       122 +  **New Implementation:**
       123 +  ```typescript
       124 +  "use client";
       125 +
       126 +  import { useState, useEffect } from "react";
       127 +  import { Button } from "@/components/ui/button";
       128 +  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
       129 +  import { Users, X } from "lucide-react";
       130 +  import { InvitePartnerModal } from "@/components/ui/invitePartnerModal";
       131 +  import { dismissInvitePrompt, getInvitePromptStatus } from "@/lib/api/userPreferencesApi";
       132 +
       133 +  export function InvitePrompt() {
       134 +      const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
       135 +      const [isDismissed, setIsDismissed] = useState(false);
       136 +      const [isLoading, setIsLoading] = useState(true);
       137 +
       138 +      useEffect(() => {
       139 +          const checkDismissalStatus = async () => {
       140 +              try {
       141 +                  const status = await getInvitePromptStatus();
       142 +                  setIsDismissed(status.dismissed);
       143 +              } catch (error) {
       144 +                  console.error('Error checking invite prompt status:', error);
       145 +                  // Default to showing prompt on error
       146 +                  setIsDismissed(false);
       147 +              } finally {
       148 +                  setIsLoading(false);
       149 +              }
       150 +          };
       151 +
       152 +          checkDismissalStatus();
       153 +      }, []);
       154 +
       155 +      const handleDismiss = async () => {
       156 +          try {
       157 +              await dismissInvitePrompt();
       158 +              setIsDismissed(true);
       159 +          } catch (error) {
       160 +              console.error('Error dismissing invite prompt:', error);
       161 +              // Still dismiss locally as fallback
       162 +              setIsDismissed(true);
       163 +          }
       164 +      };
       165 +
       166 +      // Show loading state or nothing while checking
       167 +      if (isLoading || isDismissed) {
       168 +          return null;
       169 +      }
       170 +
       171 +      return (
       172 +          <>
       173 +              <Card className="border-blue-200 bg-blue-50">
       174 +                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       175 +                      <div className="flex items-center gap-2">
       176 +                          <Users className="h-5 w-5 text-blue-600" />
       177 +                          <CardTitle className="text-lg text-blue-900">
       178 +                              See your complete spending picture
       179 +                          </CardTitle>
       180 +                      </div>
       181 +                      <Button
       182 +                          variant="ghost"
       183 +                          size="sm"
       184 +                          onClick={handleDismiss}
       185 +                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
       186 +                      >
       187 +                          <X className="h-4 w-4" />
       188 +                      </Button>
       189 +                  </CardHeader>
       190 +                  <CardContent>
       191 +                      <CardDescription className="text-blue-700 mb-4">
       192 +                          Add your partner to see shared transactions and get a complete view of your household
           + spending.
       193 +                      </CardDescription>
       194 +                      <Button
       195 +                          onClick={() => setIsInviteModalOpen(true)}
       196 +                          className="bg-blue-600 hover:bg-blue-700"
       197 +                      >
       198 +                          Invite Partner
       199 +                      </Button>
       200 +                  </CardContent>
       201 +              </Card>
       202 +
       203 +              <InvitePartnerModal
       204 +                  isOpen={isInviteModalOpen}
       205 +                  onClose={() => setIsInviteModalOpen(false)}
       206 +              />
       207 +          </>
       208 +      );
       209 +  }
       210 +  ```
       211 +
       212 +  #### **3.2 ProfileDropdown Enhancement (Optional)**
       213 +  **File:** `src/components/layout/profileDropdown.tsx`
       214 +
       215 +  **Current State:** ✅ Already functional - no changes needed
       216 +  - Line 48-52: "Invite Partner" option exists
       217 +  - Line 33-35: Opens InvitePartnerModal correctly
       218 +  - Provides persistent access after card dismissal
       219 +
       220 +  ### **Phase 4: Testing Strategy**
       221 +
       222 +  #### **4.1 Unit Tests**
       223 +  ```typescript
       224 +  // src/lib/api/__tests__/userPreferencesApi.test.ts
       225 +  describe('UserPreferences API', () => {
       226 +      test('dismissInvitePrompt calls correct endpoint', async () => {
       227 +          // Mock fetch and verify POST to /api/UserPreferences/dismiss-invite-prompt
       228 +      });
       229 +
       230 +      test('getInvitePromptStatus returns correct status', async () => {
       231 +          // Mock response and verify parsing
       232 +      });
       233 +  });
       234 +  ```
       235 +
       236 +  #### **4.2 Component Tests**
       237 +  ```typescript
       238 +  // src/components/ui/__tests__/invitePrompt.test.tsx
       239 +  describe('InvitePrompt', () => {
       240 +      test('shows card when not dismissed', async () => {
       241 +          // Mock API to return { dismissed: false }
       242 +          // Verify card renders
       243 +      });
       244 +
       245 +      test('hides card when dismissed', async () => {
       246 +          // Mock API to return { dismissed: true }
       247 +          // Verify card does not render
       248 +      });
       249 +
       250 +      test('dismisses card on X click', async () => {
       251 +          // Mock API calls
       252 +          // Click X button
       253 +          // Verify dismissInvitePrompt called and card hidden
       254 +      });
       255 +  });
       256 +  ```
       257 +
       258 +  #### **4.3 Integration Tests**
       259 +  1. **Fresh User Journey:**
       260 +     - New user sees card
       261 +     - Dismisses card
       262 +     - Card doesn't reappear on refresh
       263 +     - Can access invite via profile dropdown
       264 +
       265 +  2. **Existing User Journey:**
       266 +     - User who previously dismissed doesn't see card
       267 +     - Can still access via profile dropdown
       268 +
       269 +  ### **Phase 5: Migration & Deployment**
       270 +
       271 +  #### **5.1 Database Migration**

     Use ef core

       294 +
       295 +  #### **5.2 Deployment Sequence**
       296 +  1. Deploy backend changes (API endpoints, migration)
       297 +  2. Run database migration
       298 +  3. Deploy frontend changes
       299 +  4. Verify functionality in staging
       300 +  5. Deploy to production
       301 +
       302 +  ## 🔍 **Technical Considerations**
       303 +
       304 +  ### **Error Handling**
       305 +  - **Network Errors:** Fallback to local dismissal if API fails
       306 +  - **Loading States:** Show loading indicator while checking status
       307 +  - **Graceful Degradation:** Default to showing prompt if API unavailable
       308 +
       309 +  ### **Performance**
       310 +  - **Caching:** Consider caching dismissal status to avoid repeated API calls
       311 +  - **Lazy Loading:** Only check status when component mounts
       312 +
       313 +  ### **Security**
       314 +  - **Authorization:** Ensure only authenticated users can access endpoints
       315 +  - **Rate Limiting:** Prevent abuse of dismissal endpoint
       316 +
       317 +  ## 📊 **Success Metrics**
       318 +
       319 +  ### **Functional Requirements:**
       320 +  - ✅ Card shows for new users
       321 +  - ✅ Card disappears permanently when dismissed
       322 +  - ✅ Card doesn't reappear on page refresh
       323 +  - ✅ Invite functionality remains accessible via profile dropdown
       324 +  - ✅ No impact on existing invite functionality
       325 +
       326 +  ### **Technical Requirements:**
       327 +  - ✅ Zero data loss during migration
       328 +  - ✅ Backward compatibility maintained
       329 +  - ✅ Performance impact < 100ms for status check
       330 +  - ✅ Error rates < 1% for dismissal actions
       331 +
       332 +  ## 🎯 **Implementation Priority**
       333 +
       334 +  ### **High Priority (Must Have):**
       335 +  1. Backend API endpoints for dismissal persistence
       336 +  2. Frontend API integration
       337 +  3. Component state management updates
       338 +  4. Database migration
       339 +
       340 +  ### **Medium Priority (Should Have):**
       341 +  1. Comprehensive error handling
       342 +  2. Loading states and UX improvements
       343 +  3. Unit and integration tests
       344 +
       345 +  ### **Low Priority (Nice to Have):**
       346 +  1. Analytics tracking for dismissal rates
       347 +  2. A/B testing different prompt designs
       348 +  3. Caching optimizations
       349 +
       350 +  ---
       351 +
       352 +  ## 📁 **Files to Modify**
       353 +
       354 +  ### **Backend Files:**
       355 +  - `PersonifiBackend/src/PersonifiBackend.Core/Entities/User.cs` - Add InvitePromptDismissed property
       356 +  - `PersonifiBackend/src/PersonifiBackend.Api/Controllers/UserPreferencesController.cs` - New controller
       357 +  - `PersonifiBackend/src/PersonifiBackend.Application/Services/UserPreferencesService.cs` - New service
       358 +  - `PersonifiBackend/src/PersonifiBackend.Infrastructure/Data/PersonifiDbContext.cs` - Update DbContext
       359 +  - New migration file for database schema update
       360 +
       361 +  ### **Frontend Files:**
       362 +  - `src/lib/api/userPreferencesApi.ts` - New API client functions
       363 +  - `src/components/ui/invitePrompt.tsx` - Update with persistent dismissal
       364 +  - Add test files for new functionality
       365 +
       366 +  ### **Files That Stay the Same:**
       367 +  - `src/components/layout/profileDropdown.tsx` ✅ (Already functional)
       368 +  - `src/components/ui/invitePartnerModal.tsx` ✅ (No changes needed)
       369 +
       370 +  This plan provides a comprehensive approach to implementing persistent invite prompt dismissal while maintaining
           + all existing functionality and providing a clear upgrade path.
       371   \ No newline at end of file
