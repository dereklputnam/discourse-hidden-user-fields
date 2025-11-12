import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "custom-field-visibility",

  initialize(container) {
    console.log("[Custom Field Visibility] Initializer starting...");

    withPluginApi("0.8", (api) => {
      // Get current user
      const currentUser = api.getCurrentUser();
      console.log("[Custom Field Visibility] Current user:", currentUser?.username);

      if (!currentUser) {
        console.log("[Custom Field Visibility] No current user - exiting");
        return;
      }

      // Get settings from global settings object (available in theme JavaScript)
      const allowedGroupName = settings.allowed_group_name;
      const customFieldName = settings.custom_field_name;

      console.log("[Custom Field Visibility] Settings:", {
        allowedGroupName,
        customFieldName,
        settingsObject: typeof settings !== 'undefined' ? 'available' : 'not available'
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
          const fieldName = customField.dasherized_name || customField.name.toLowerCase().replace(/\s+/g, '-');
          const style = document.createElement('style');
          style.id = `custom-field-visibility-${fieldId}`;
          style.innerHTML = `
            .public-user-field.${fieldName} { display: none !important; }
            .user-field-${fieldId} { display: none !important; }
            .user-profile-fields .user-field-${fieldId} { display: none !important; }
            .public-user-fields .user-field-${fieldId} { display: none !important; }
            .collapsed-info .user-field[data-field-id="${fieldId}"] { display: none !important; }
          `;
          document.head.appendChild(style);
          console.log("[Custom Field Visibility] Injected CSS to hide field ID:", fieldId, "name:", fieldName);

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
