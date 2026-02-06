# Hidden User Fields for Discourse

> **⚠️ Disclaimer:** The author assumes no liability for data exposure or unintended visibility of user fields. Test thoroughly before production use.

A Discourse theme component that controls visibility of custom user fields based on group membership. Hide sensitive or internal user fields from public view while making them visible to specific groups.

## Features

- **Group-Based Visibility**: Control which groups can see which custom user fields
- **Multiple Rules**: Configure multiple field/group combinations
- **User Card & Profile**: Works on both user cards (hover) and full profile pages
- **Directory Filtering**: Hides users with restricted field values from the user directory
- **Native Display**: Uses Discourse's native field styling
- **Easy Configuration**: Object editor with group picker for managing visibility rules

## Important Limitations

> **⚠️ Search Limitation:** This theme component **cannot prevent users from appearing in search results** when searching for values in hidden fields. Discourse search indexing happens server-side and theme components cannot modify it.

**What this means:**
- Hidden field **values are hidden** from view on profiles and user cards ✅
- Users **with hidden field values are filtered** from the user directory ✅
- Users **still appear in search results** when searching for hidden field values ❌

**Why:**
- Theme components run client-side only (CSS + JavaScript)
- Search indexing and API responses are server-side (Ruby)
- Hidden field data is still indexed and searchable by Discourse

**To completely prevent searchability:** You would need a full Discourse plugin (not a theme component) that modifies server-side behavior. This is significantly more complex and requires server installation.

## Installation

### Option 1: Install from GitHub (Recommended)

1. Go to your Discourse admin panel
2. Navigate to **Customize > Themes**
3. Click **Install** > **From a git repository**
4. Enter: `https://github.com/dereklputnam/discourse-hidden-user-fields`
5. Click **Install**

### Option 2: Install from File

1. Download or clone this repository
2. Zip the entire directory
3. Go to **Customize > Themes** in Discourse admin
4. Click **Install** > **From a file**
5. Upload the zip file

## Configuration

After installation, configure visibility rules:

1. Click on the installed theme
2. Go to **Settings**
3. Edit **field_visibility_rules** using the object editor
4. For each rule:
   - Click **Add Field**
   - Enter the **Field Name** (exact name of your custom user field)
   - Use the **Allowed Groups** picker to select one or more groups
   - Click the checkmark to save

**Example:**
- Field Name: `company`
- Allowed Groups: Select `employees` from the group picker

Users in ANY of the selected groups will be able to see the field.

## Requirements

- Custom user fields must be created in **Admin > Customize > User Fields**
- Groups must exist for the visibility rules to work
- Users must be members of the specified groups to see the fields

## Theme Structure

```
discourse-hidden-user-fields/
├── about.json                          # Theme metadata
├── settings.yml                        # Theme settings schema
├── common/
│   └── common.scss                     # Minimal CSS placeholder
└── javascripts/discourse/initializers/
    └── custom-field-visibility.js      # Main logic
```

## How It Works

1. On page load, the initializer reads your visibility rules
2. For each rule, it finds the corresponding custom field by name
3. Hide CSS is injected once per field to hide it from everyone by default
4. For each rule, if the current user is in any of the allowed groups, show CSS is injected for that specific field
5. Users with values in hidden fields are filtered from the user directory (client-side)
6. Fields are only visible when the user has permission via group membership

**Note:** The component hides field values on profiles/cards with CSS and filters users from the directory listing. However, it cannot modify server-side search indexing, so users may still appear in search results based on hidden field values.

## Frequently Asked Questions

### Why do users still appear in search results for hidden fields?

Discourse's search functionality indexes user fields server-side and theme components cannot modify this behavior. To truly prevent search indexing of certain fields, you would need:

1. **A full Discourse plugin** (Ruby + JavaScript) that modifies server-side search indexing
2. **Or** use Discourse's built-in "Show on profile" toggle in User Fields settings to make fields completely private (but this affects all users, not just specific groups)

### Can I make this more secure?

The most secure approaches, in order:

1. **Don't store sensitive data in user fields** - Use a separate system for truly sensitive information
2. **Use Discourse's built-in privacy settings** - Uncheck "Show on profile" for sensitive fields
3. **Use a full server-side plugin** - Requires Ruby development and server installation
4. **Use this theme component** - Hides values from UI but data is still in the HTML and search index

### What about the API?

Hidden field values are still accessible via Discourse's public API endpoints (e.g., `/u/{username}.json`). Theme components cannot restrict API access. Only server-side plugins or Discourse's built-in privacy settings can control API responses.

## License

MIT
