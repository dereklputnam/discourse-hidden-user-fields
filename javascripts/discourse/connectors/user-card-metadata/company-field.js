import { computed } from "@ember/object";

export default {
  setupComponent(args, component) {
    const siteSettings = component.siteSettings;
    const customFieldName = siteSettings.custom_field_visibility_custom_field_name;
    const fieldLabel = siteSettings.custom_field_visibility_field_label;

    component.setProperties({
      fieldLabel: fieldLabel,

      customFieldValue: computed("args.user.user_fields", function () {
        const user = args.user;
        if (!user?.user_fields) {
          return null;
        }

        // Find the custom field ID
        const site = component.site;
        if (site?.user_fields) {
          const customField = site.user_fields.find(
            (field) => field.name.toLowerCase() === customFieldName.toLowerCase()
          );

          if (customField?.id) {
            return user.user_fields[customField.id];
          }
        }

        return null;
      })
    });
  }
};
