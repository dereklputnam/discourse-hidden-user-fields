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

      // Get settings
      const allowedGroupName = siteSettings.custom_field_visibility_allowed_group_name;
      const customFieldName = siteSettings.custom_field_visibility_custom_field_name;

      if (!allowedGroupName || !customFieldName) {
        return;
      }

      // Check if user is in the allowed group
      const userGroups = currentUser.groups || [];
      const isInAllowedGroup = userGroups.some(
        (group) => group.name === allowedGroupName
      );

      if (isInAllowedGroup) {
        // Find the custom field ID
        const site = container.lookup("service:site");
        const userFields = site.get("user_fields");

        if (userFields) {
          const customField = userFields.find(
            (field) => field.name.toLowerCase() === customFieldName.toLowerCase()
          );

          if (customField) {
            // Add body class to show this field
            document.body.classList.add(`show-custom-field-${customField.id}`);
          }
        }
      }
    });
  }
};
