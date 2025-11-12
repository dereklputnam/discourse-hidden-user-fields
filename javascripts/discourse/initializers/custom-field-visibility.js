import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "custom-field-visibility",

  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");

    withPluginApi("0.8", (api) => {
      // Get current user
      const currentUser = api.getCurrentUser();

      if (!currentUser) {
        // User not logged in - hide all fields
        return;
      }

      // Get settings - theme settings are accessed with theme name prefix
      const allowedGroupName = siteSettings.allowed_group_name;
      const customFieldName = siteSettings.custom_field_name;

      if (!allowedGroupName || !customFieldName) {
        return;
      }

      // Check if user is in the allowed group
      const userGroups = currentUser.groups || [];
      const isInAllowedGroup = userGroups.some(
        (group) => group.name === allowedGroupName
      );

      // Find the custom field ID
      const site = container.lookup("service:site");
      const userFields = site.get("user_fields");

      if (userFields) {
        const customField = userFields.find(
          (field) => field.name.toLowerCase() === customFieldName.toLowerCase()
        );

        if (customField) {
          // Hide this specific field by default for everyone
          const fieldId = customField.id;
          const style = document.createElement('style');
          style.id = `custom-field-visibility-${fieldId}`;
          style.innerHTML = `.user-field-${fieldId} { display: none !important; }`;
          document.head.appendChild(style);

          // If user is in allowed group, show the field
          if (isInAllowedGroup) {
            document.body.classList.add(`show-custom-field-${fieldId}`);
          }
        }
      }
    });
  }
};
