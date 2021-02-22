
module.exports = {
    // MySql Models
    UserRole: require('./UserRoleModel'),
    User: require('./UserModel'),
    LoginReport: require('./LoginReportModel'),
    ForgotPassword: require('./ForgotPasswordModel'),
    ActivityLog: require('./ActivityLogModel'),
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
    listRecordValues: require('./ListRecordValues')

}