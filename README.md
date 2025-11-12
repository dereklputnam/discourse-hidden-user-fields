# Custom Field Visibility Theme for Discourse

A Discourse theme component that controls visibility of custom user fields based on group membership. Hide sensitive or internal user fields from public view while making them visible to specific groups.

## Features

- **Group-Based Visibility**: Control which groups can see which custom user fields
- **Multiple Rules**: Configure multiple field/group combinations
- **User Card & Profile**: Works on both user cards (hover) and full profile pages
- **Native Display**: Uses Discourse's native field styling
- **Easy Configuration**: JSON object editor for managing visibility rules

## Installation

### Option 1: Install from GitHub (Recommended)

1. Go to your Discourse admin panel
2. Navigate to **Customize > Themes**
3. Click **Install** > **From a git repository**
4. Enter this repository URL
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
3. Edit **field_visibility_rules** using the JSON editor
4. Add rules in this format:

```yaml
- field_name: company
  allowed_group: netwrix_employees
- field_name: department
  allowed_group: staff
- field_name: employee_id
  allowed_group: admins
```

### Rule Properties

- **field_name**: The exact name of the custom user field (case-insensitive)
- **allowed_group**: The name of the group that can see this field

## Requirements

- Custom user fields must be created in **Admin > Customize > User Fields**
- Groups must exist for the visibility rules to work
- Users must be members of the specified groups to see the fields

## Theme Structure

```
discourse-company-field-theme/
├── about.json                          # Theme metadata
├── settings.yml                        # Theme settings schema
├── common/
│   └── common.scss                     # CSS for showing fields
└── javascripts/discourse/initializers/
    └── custom-field-visibility.js      # Main logic
```

## How It Works

1. On page load, the initializer reads your visibility rules
2. For each rule, it finds the corresponding custom field
3. CSS is injected to hide that field from everyone
4. If the current user is in the allowed group, a body class is added
5. The CSS then shows the field only when that body class is present

## License

MIT
