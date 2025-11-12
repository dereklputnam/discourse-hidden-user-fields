import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "custom-field-visibility",

  initialize(container) {
    console.log("[Custom Field Visibility] Initializer starting...");
    const siteSettings = container.lookup("service:site-settings");

    withPluginApi("0.8", (api) => {
      // Get current user
      const currentUser = api.getCurrentUser();
      console.log("[Custom Field Visibility] Current user:", currentUser?.username);

      if (!currentUser) {
        console.log("[Custom Field Visibility] No current user - exiting");
        return;
      }

      // Get settings - try different possible prefixes
      let allowedGroupName = siteSettings.allowed_group_name;
      let customFieldName = siteSettings.custom_field_name;

      // Try with theme name prefix if not found
      if (!allowedGroupName) {
        allowedGroupName = siteSettings.custom_field_visibility_allowed_group_name;
      }
      if (!customFieldName) {
        customFieldName = siteSettings.custom_field_visibility_custom_field_name;
      }

      console.log("[Custom Field Visibility] Settings:", {
        allowedGroupName,
        customFieldName,
        allSettings: Object.keys(siteSettings).filter(k => k.includes('custom_field') || k.includes('allowed_group')),
        allKeys: Object.keys(siteSettings).sort()
      });

      if (!allowedGroupName || !customFieldName) {
        console.log("[Custom Field Visibility] Missing settings - exiting");
        return;
      }

      // Check if user is in the allowed group
      const userGroups = currentUser.groups || [];
      console.log("[Custom Field Visibility] User groups:", userGroups.map(g => g.name));

      const isInAllowedGroup = userGroups.some(
        (group) => group.name === allowedGroupName
      );
      console.log("[Custom Field Visibility] Is in allowed group?", isInAllowedGroup);

      // Find the custom field ID
      const site = container.lookup("service:site");
      const userFields = site.get("user_fields");
      console.log("[Custom Field Visibility] Available user fields:", userFields);

      if (userFields) {
        const customField = userFields.find(
          (field) => field.name.toLowerCase() === customFieldName.toLowerCase()
        );
        console.log("[Custom Field Visibility] Found custom field:", customField);

        if (customField) {
          // Hide this specific field by default for everyone
          const fieldId = customField.id;
          const style = document.createElement('style');
          style.id = `custom-field-visibility-${fieldId}`;
          style.innerHTML = `.user-field-${fieldId} { display: none !important; }`;
          document.head.appendChild(style);
          console.log("[Custom Field Visibility] Injected CSS to hide field ID:", fieldId);

          // If user is in allowed group, show the field
          if (isInAllowedGroup) {
            document.body.classList.add(`show-custom-field-${fieldId}`);
            console.log("[Custom Field Visibility] Added body class: show-custom-field-" + fieldId);
          } else {
            console.log("[Custom Field Visibility] User not in allowed group - field will stay hidden");
          }
        }
      }
    });
  }
};
