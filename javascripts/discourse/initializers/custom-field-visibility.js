import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "custom-field-visibility",

  initialize(container) {
    withPluginApi("0.8", (api) => {
      const currentUser = api.getCurrentUser();
      const rules = settings.field_visibility_rules;

      if (!rules || rules.length === 0) {
        return;
      }

      // Get user groups (empty array if not logged in)
      const userGroups = currentUser?.groups || [];
      const userGroupIds = userGroups.map(g => g.id);

      const site = container.lookup("service:site");
      const userFields = site.get("user_fields");

      if (!userFields) {
        return;
      }

      // Track which fields have already been processed for hiding
      const processedFields = new Set();

      // Track which field IDs should be hidden for current user
      const hiddenFieldIds = new Set();

      rules.forEach((rule, ruleIndex) => {
        const customField = userFields.find(
          (field) => field.name.toLowerCase() === rule.field_name.toLowerCase()
        );

        if (!customField) {
          return;
        }

        const fieldId = customField.id;
        const fieldName = customField.dasherized_name || customField.name.toLowerCase().replace(/\s+/g, '-');

        // Check if user is in any of the allowed groups for this rule
        // groups type returns an array of group IDs
        const allowedGroupIds = Array.isArray(rule.allowed_groups) ? rule.allowed_groups : [];
        const isInAllowedGroup = allowedGroupIds.length > 0 && allowedGroupIds.some(groupId => userGroupIds.includes(groupId));

        // Only inject hide CSS once per field
        if (!processedFields.has(fieldId)) {
          const hideStyle = document.createElement('style');
          hideStyle.id = `custom-field-visibility-hide-${fieldId}`;
          hideStyle.innerHTML = `
            .public-user-field.${fieldName} { display: none !important; }
            .public-user-field.public-user-field__${fieldName} { display: none !important; }
            .user-card .public-user-field.${fieldName} { display: none !important; }
            .user-card .public-user-field__${fieldName} { display: none !important; }
            .user-field-${fieldId} { display: none !important; }
            .user-profile-fields .user-field-${fieldId} { display: none !important; }
            .public-user-fields .user-field-${fieldId} { display: none !important; }
            .collapsed-info .user-field[data-field-id="${fieldId}"] { display: none !important; }
          `;
          document.head.appendChild(hideStyle);
          processedFields.add(fieldId);

          // Track if this field should be hidden from current user
          if (!isInAllowedGroup) {
            hiddenFieldIds.add(fieldId);
          }
        }

        if (isInAllowedGroup) {
          // Inject specific show CSS for this field with unique ID per rule
          const showStyle = document.createElement('style');
          showStyle.id = `custom-field-visibility-show-${fieldId}-rule-${ruleIndex}`;
          showStyle.innerHTML = `
            .public-user-field.${fieldName} { display: block !important; }
            .public-user-field.public-user-field__${fieldName} { display: block !important; }
            .user-card .public-user-field.${fieldName} { display: block !important; }
            .user-card .public-user-field__${fieldName} { display: block !important; }
            .user-field-${fieldId} { display: block !important; }
            .user-profile-fields .user-field-${fieldId} { display: block !important; }
            .public-user-fields .user-field-${fieldId} { display: block !important; }
            .collapsed-info .user-field[data-field-id="${fieldId}"] { display: block !important; }
          `;
          document.head.appendChild(showStyle);
        }
      });

      // Early return if user can see all fields
      if (hiddenFieldIds.size === 0) {
        return;
      }

      // Helper function to check if a user should be hidden from search/directory
      // based on whether they have values in fields the current user cannot see
      const shouldHideUser = (user) => {
        if (!user || !user.user_fields) {
          return false;
        }

        // Check if user has any non-empty value in fields that are hidden from current user
        for (const fieldId of hiddenFieldIds) {
          const fieldValue = user.user_fields[fieldId];
          if (fieldValue && fieldValue.toString().trim() !== '') {
            return true;
          }
        }

        return false;
      };

      // Hide user cards in directory
      api.modifyClass("component:directory-item", {
        pluginId: "custom-field-visibility",

        didInsertElement() {
          this._super(...arguments);
          const user = this.args?.user || this.user;

          if (user && shouldHideUser(user)) {
            this.element?.classList.add('hidden-by-field-visibility');
          }
        }
      });

      // Add CSS to hide filtered users
      const filterStyle = document.createElement('style');
      filterStyle.id = 'custom-field-visibility-filter';
      filterStyle.innerHTML = `
        .directory-table__row.hidden-by-field-visibility,
        .directory .hidden-by-field-visibility,
        .user-list .hidden-by-field-visibility {
          display: none !important;
        }
      `;
      document.head.appendChild(filterStyle);

      // Note: Search results filtering
      // Unfortunately, Discourse search results don't include user_fields data in the API response,
      // so we cannot effectively filter search results client-side.
      // The best we can do is hide the field values themselves (which we already do with CSS above).
      // To truly prevent users from appearing in search by hidden field values,
      // a full server-side plugin would be required.
    });
  }
};
