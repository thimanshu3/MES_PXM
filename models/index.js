
module.exports = {
    // MySql Models
    UserRole: require('./UserRoleModel'),
    User: require('./UserModel'),
    LoginReport: require('./LoginReportModel'),
    ForgotPassword: require('./ForgotPasswordModel'),
    AttributeSet: require('./AttributeSet'),
    AttributeValueSets: require('./AttributeValueSets'),
    CatalogueHierarchy: require('./CatalogeHierarchy'),
    Distributor: require('./Distributor'),
    Manufacturer: require('./Manufacturer'),
    ProductType: require('./ProductType'),
    Vendor: require('./Vendor'),
    Catalogue: require('./Catalogue'),
    fieldGroups: require('./fieldGroups'),
    fieldsAssignedToGroup: require('./fieldsAssignedToGroup'),
    inputFields: require('./inputFields'),
    inputTypes: require('./inputTypes'),
    listRecord: require('./ListRecord'),
    listRecordValues: require('./ListRecordValues'),
    form: require('./form'),
    formParts: require('./formParts'),
    formConfig: require('./formConfig'),
    productMetaData: require('./productMeta'),
    productData: require('./productData'),
    productTable: require('./productTable'),
    tableFieldGroup: require('./tableFieldGroup'),
    productSpecificTableData: require('./productSpecificTableData'),
    //mongo Models
    ActivityLog: require('./ActivityLogModel'),
    FormDesign:require('./FormDataModel')


}