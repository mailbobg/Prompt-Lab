# Data Import & Export Guide

## Overview

PROMPT STASH provides comprehensive data import and export functionality, allowing you to easily backup and restore all application data.

## Export Features

### How to Export Data
1. Click the **download icon** (📥) in the header toolbar
2. Configure export options in the selective export dialog:
   - **Data Types**: Choose which data types to export (Prompts, Chat History, Settings)
   - **Preview**: View the filename and data content that will be generated
3. Click **Start Export**
4. The system will generate and automatically download the corresponding JSON file based on your selection

### Export File Naming Rules
- **All Data**: `prompt-stash-all-YYYY-MM-DD.json`
- **Single Type**: `prompt-stash-prompts-YYYY-MM-DD.json`
- **Multiple Types**: `prompt-stash-prompts-chats-YYYY-MM-DD.json`

### Exported Data Includes
- **All Prompts**: Including titles, content, tags, categories, usage counts, ratings, etc.
- **All Chat History**: Including conversation history, message content, timestamps, etc.
- **App Settings**: Theme, language, auto-save and other preference settings
- **Metadata**: Export time, version information, etc.

> **Security Note**: API keys are not exported to protect your privacy.

### Export File Format
```json
{
  "prompts": [...],
  "chats": [...],
  "settings": {...},
  "exportedAt": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0",
  "appName": "PROMPT STASH"
}
```

## Import Features

### How to Import Data
1. Click the **upload icon** (📤) in the header toolbar
2. Configure import options in the selective import dialog:
   - **Import Mode**: Choose "Merge Mode" or "Replace Mode"
   - **Data Types**: Choose which data types to import (Prompts, Chat History, Settings)
3. Click **Start Import** and then select the JSON file to import
4. The system will parse and import data according to your configuration, then reload the application

### Import Mode Explanation

#### Merge Mode (Recommended)
- Keep existing data, add new data
- If items with the same ID exist, new data will overwrite old data
- Suitable for: Incremental import, merging multiple backups

#### Replace Mode
- Completely clear existing data of selected types
- Replace with data from the import file
- Suitable for: Complete recovery, clean data rebuild

### Security Measures Before Import
- **Automatic Backup**: Current data will be automatically backed up to localStorage before import
- **Data Validation**: The system will validate the format and data integrity of the import file
- **Error Handling**: Import failures will not affect existing data

### Selective Import Dialog
The import operation displays a detailed configuration dialog, including:
- **Import Mode Selection**: Merge mode or replace mode
- **Data Type Selection**: Selectively import specific types of data
- **Security Notes**: Explains that API keys will not be imported, current data will be automatically backed up
- **Warning Information**: Data deletion warnings are displayed in replace mode

## Use Cases

### Data Backup
- **Complete Backup**: Export all data as a complete backup
- **Incremental Backup**: Export only specific types of data
- **Regular Backup**: Choose different data combinations as needed
- **Migration Preparation**: Export critical data before device migration

### Data Sharing
- **Prompt Sharing**: Export only prompts to share ideas with team
- **Template Sharing**: Export settings configuration to share app setup
- **Learning Exchange**: Export chat history to share conversation examples

### Data Analysis
- **Usage Analysis**: Export chat history to analyze usage patterns
- **Content Management**: Export prompts for external editing
- **Backup Strategy**: Selectively backup different data based on importance

### Data Recovery
- **Selective Recovery**: Restore only needed data types
- **Merge Recovery**: Merge backup data with existing data
- **Complete Recovery**: Use replace mode to completely restore all data

## Important Notes

### Data Security
- Export files contain application data, please keep them safe
- Avoid transmitting backup files in unsecure network environments
- API keys are not exported to protect your privacy

### Compatibility
- Import files must be in valid JSON format
- It's recommended to use the same version of the application for import/export
- Different versions may have data structure differences

### Best Practices
1. **Regular Backups**: It's recommended to export data weekly or monthly
2. **Version Management**: Include version or date information in export filenames
3. **Test Recovery**: Regularly test the availability of backup files
4. **Multiple Backups**: Save backup files in multiple locations

## Troubleshooting

### Export Failures
- Check if browser allows file downloads
- Ensure sufficient storage space
- Clear browser cache and retry

### Import Failures
- Verify if JSON file format is correct
- Check if file contains necessary data fields
- Ensure file size is within reasonable range

### Data Loss
- Check automatic backups in localStorage
- Review browser download history
- Contact technical support for assistance

## Technical Implementation

The import/export functionality uses the following technologies:
- **Storage**: localStorage API
- **File Processing**: File API and Blob API
- **Data Validation**: JSON parsing and type checking
- **User Interaction**: Custom confirmation dialogs

These features ensure data security, integrity, and consistent user experience. 