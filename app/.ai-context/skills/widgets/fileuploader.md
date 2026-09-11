# File uploader

- **Widget ID:** `com.mendix.widget.web.fileuploader.FileUploader`
- **Type:** PLUGGABLEWIDGET
- **Version:** 2.2.2

## MDL Example

```sql
PLUGGABLEWIDGET 'com.mendix.widget.web.fileuploader.FileUploader' widget1 {
  allowedfileformat item1   -- one entry of `allowedFileFormats`
  custombutton item2   -- one entry of `customButtons`
}
```

## Properties

| Property | Type | Required | Default | Values / notes | Group | Description |
|----------|------|----------|---------|----------------|-------|-------------|
| `uploadMode` | enumeration | Yes | files | `files` \| `images` | General | Upload mode |
| `associatedFiles` | datasource | Yes | FileUploader.FileUploadContext/FileUploader.UploadedFile_FileUploadContext/FileUploader.UploadedFile | list | General | Associated files |
| `associatedImages` | datasource | Yes | FileUploader.FileUploadContext/FileUploader.UploadedImage_FileUploadContext/FileUploader.UploadedImage | list | General | Associated images |
| `readOnlyMode` | boolean | Yes | false |  | General | Read-only mode |
| `createFileAction` | action | Yes | FileUploader.ACT_CreateUploadedFileDocument |  | General | Nanoflow that creates a file object, associates it to the current object and commits it. |
| `createImageAction` | action | Yes | FileUploader.ACT_CreateUploadedImageDocument |  | General | Nanoflow that creates an image object, associates it to the current object and commits it. |
| `allowedFileFormats` | object |  |  | list; 5 sub-properties below | General | No restrictions if left empty. |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ `configMode` | enumeration | Yes | simple | `simple` \| `advanced` |  | Configuration mode |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ `predefinedType` | enumeration | Yes | pdfFile | `pdfFile` \| `msWordFile` \| `msExcelFile` \| `msPowerPointFile` \| `plainTextFile` \| `csvFile` \| `zipArchiveFile` \| `anyTextFile` \| `anyImageFile` \| `anyAudioFile` \| `anyVideoFile` |  | Predefined type |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ `mimeType` | string |  |  |  |  | For example 'image/jpeg' or 'application/pdf' |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ `extensions` | string |  |  |  |  | Comma separated list of extensions. For example: '.jpg,.jpeg'. |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ `typeFormatDescription` | textTemplate | Yes |  |  |  | Shown to the end users to describe supported file types. |
| `maxFilesPerUpload` | integer | Yes | 10 |  | General | Limit the number of files per one upload. |
| `maxFileSize` | integer | Yes | 25 |  | General | Reject files that are bigger than specified size. |
| `dropzoneIdleMessage` | textTemplate | Yes |  |  | Texts | Dropzone message |
| `dropzoneAcceptedMessage` | textTemplate | Yes |  |  | Texts | Dropzone hover for uploadable files |
| `dropzoneRejectedMessage` | textTemplate | Yes |  |  | Texts | Dropzone hover for non uploadable files |
| `uploadInProgressMessage` | textTemplate | Yes |  |  | Texts | Uploading in progress |
| `uploadSuccessMessage` | textTemplate | Yes |  |  | Texts | Uploading success |
| `uploadFailureGenericMessage` | textTemplate | Yes |  |  | Texts | Uploading unknown error |
| `uploadFailureInvalidFileFormatMessage` | textTemplate | Yes |  |  | Texts | Invalid file format |
| `uploadFailureFileIsTooBigMessage` | textTemplate | Yes |  |  | Texts | File is too big |
| `uploadFailureTooManyFilesMessage` | textTemplate | Yes |  |  | Texts | Too many files |
| `unavailableCreateActionMessage` | textTemplate | Yes |  |  | Texts | Action to create new files is not available or failed |
| `downloadButtonTextMessage` | textTemplate | Yes |  |  | Texts | Download button |
| `removeButtonTextMessage` | textTemplate | Yes |  |  | Texts | Remove button |
| `removeSuccessMessage` | textTemplate | Yes |  |  | Texts | File removal success |
| `removeErrorMessage` | textTemplate | Yes |  |  | Texts | File removal failure |
| `objectCreationTimeout` | integer | Yes | 10 |  | Advanced | Consider uploads unsuccessful if the Action to create new files/images does not create new objects within the configured amount of seconds. |
| `enableCustomButtons` | boolean | Yes | false |  | Advanced | Enable custom buttons |
| `customButtons` | object |  |  | list; 6 sub-properties below | Advanced | Custom buttons |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ `buttonCaption` | textTemplate | Yes |  |  |  | Caption |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ `buttonIcon` | icon | Yes |  |  |  | Icon |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ `buttonActionFile` | action | Yes |  |  |  | Action |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ `buttonActionImage` | action | Yes |  |  |  | Action |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ `buttonIsDefault` | boolean | Yes | false |  |  | When set to Yes, the action will be triggered by clicking on the file entry. |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ `buttonIsVisible` | expression | Yes | true |  |  | The button will be hidden when false is returned. |

## Object Lists (repeating child entries)

### `allowedfileformat` → property `allowedFileFormats`

Item properties:

| Property | Operation |
|----------|-----------|
| `configMode` | primitive |
| `predefinedType` | primitive |
| `mimeType` | primitive |
| `extensions` | primitive |
| `typeFormatDescription` | texttemplate |

### `custombutton` → property `customButtons`

Item properties:

| Property | Operation |
|----------|-----------|
| `buttonCaption` | texttemplate |
| `buttonActionFile` | action |
| `buttonActionImage` | action |
| `buttonIsDefault` | primitive |
| `buttonIsVisible` | expression |

---

Regenerated by `mxcli widget docs` and by `refresh catalog`. For the same data live from the `.mpk` — including anything added by a widget upgrade since this file was written — run `mxcli widget describe fileuploader -p <app.mpr>`.
