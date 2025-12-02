const _utility = require('./modules/utility.js');
// const _common               = require('./modules/common.js');
const _dashboard = require('./modules/dashboard.js');
const _register = require('./modules/registeruser.js');
const _facilities = require('./modules/facilities.js');
const _projectActivities = require('./modules/projectActivities.js');
const _taskComments = require('./modules/taskComments.js');
const validationSchemas = require('./middlewares/validationSchemas.js');
const ValidationMiddleware = require('./middlewares/validate.js');
const upload = require('./middlewares/upload.js');
const _templates = require('./modules/templates.js');
// const _anomalyFlags = require('./modules/anomalyFlags.js');

const cors = require('cors');

const utility = new _utility();

// Validation
const validation = ValidationMiddleware(utility);

const register = new _register(utility);
const facilities = new _facilities(utility);
const projectActivities = new _projectActivities(utility);
const taskComments = new _taskComments(utility);
const templates = new _templates(utility);
// const anomalyFlags = new _anomalyFlags(utility);

const compression = require('compression');
utility.app.use(compression());

const helmet = require('helmet');
utility.app.use(helmet());
const bodyParser = require('body-parser');


utility.app.use(utility.express.json())
utility.app.use(bodyParser.json());
utility.app.use(bodyParser.json({ limit: '100mb' }));
utility.app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
// utility.app.use(utility.bodyParser.json());



// utility.app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

utility.app.use(cors({
  origin: [process.env.FRONTEND_URL, "http://localhost:3000"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));




const dotenv = require('dotenv');


if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env.local' });
}



// Old 
// utility.app.post('/UserLogin' ,                                                                 register.UserLogin);

// New

// utility.app.post('/user/login', 
//   validation.validate(validationSchemas.login),
//   register.UserLogin
// );

utility.app.post('/user/login', (req, res, next) => {
  next();
},
  validation.validate(validationSchemas.login),
  (req, res, next) => {
    next();
  },
  register.UserLogin
);


utility.app.post('/user/logout',
  utility.authenticateToken,
  register.UserLogout
);

utility.app.post('/user/update-password',
  utility.authenticateToken,
  validation.validate(validationSchemas.updatePassword),
  register.UpdateUserPassword
);

utility.app.post('/auth/register',
  validation.validate(validationSchemas.registerUser),
  register.RegisterUser
);
// Facilities
utility.app.get('/facilities/search',
  utility.authenticateToken,
  facilities.searchFacilitiesByUser
);

utility.app.get('/facilities/accessible',
  utility.authenticateToken,
  validation.validate(validationSchemas.getAccessibleFacilities, 'query'),
  facilities.GetAccessibleFacilities
);

// Project Activities
utility.app.post('/project/add',
  utility.authenticateToken,
  validation.validate(validationSchemas.addProjectActivity),
  projectActivities.AddActivityToProject
);

utility.app.post('/project/check-unresolved-flags',
  utility.authenticateToken,
  validation.validate(validationSchemas.checkUnresolvedFlags),
  projectActivities.CheckUnresolvedFlags
);

utility.app.post('/project/create-tasks',
  utility.authenticateToken,
  validation.validate(validationSchemas.createProjectRequest),
  projectActivities.CreateProjectRequest
);


// previous createProject
// utility.app.post('/project/create',
//   utility.authenticateToken,
//   validation.validate(validationSchemas.createProject),
//   projectActivities.CreateProject
// );

utility.app.put('/project/customize-scopes',
  utility.authenticateToken,
  validation.validate(validationSchemas.customizeActiveScopes),
  projectActivities.CustomizeActiveScopes
);

utility.app.get('/project/data-collection-sheet/scope',
  utility.authenticateToken,
  validation.validate(validationSchemas.getDataCollectionSheetForScope, 'query'),
  projectActivities.GetDataCollectionSheetForScope
);

utility.app.get('/activities/subcategory',
  utility.authenticateToken,
  validation.validate(validationSchemas.getActivitiesForSubcategory, 'query'),
  projectActivities.GetActivitiesForSubcategory
);

utility.app.get('/user/requests',
  utility.authenticateToken,
  validation.validate(validationSchemas.getAllRequestsForUser),
  projectActivities.GetAllRequestsForUser
);

utility.app.get('/users/assignable',
  utility.authenticateToken,
  validation.validate(validationSchemas.getAssignableUsers),
  projectActivities.GetAssignableUsers
);

utility.app.get('/project/export-data',
  utility.authenticateToken,
  validation.validate(validationSchemas.getDataForExport, 'query'),
  projectActivities.GetDataForExport
);

utility.app.get('/categories/main',
  utility.authenticateToken,
  validation.validate(validationSchemas.getMainCategoriesForScopeAndSource, 'query'),
  projectActivities.GetMainCategoriesForScopeAndSource
);

utility.app.get('/project/preview-data/scope',
  utility.authenticateToken,
  validation.validate(validationSchemas.getPreviewDataForScope, 'query'),
  projectActivities.GetPreviewDataForScope
);

utility.app.get('/activities/selection1-options',
  utility.authenticateToken,
  validation.validate(validationSchemas.getSelection1ForActivity, 'query'),
  projectActivities.GetSelection1ForActivity
);

utility.app.get('/activities/selection2-options',
  utility.authenticateToken,
  validation.validate(validationSchemas.getSelection2ForSelection1, 'query'),
  projectActivities.GetSelection2ForSelection1
);

utility.app.get('/categories/subcategories',
  utility.authenticateToken,
  validation.validate(validationSchemas.getSubcategoriesForMainCategory, 'query'),
  projectActivities.GetSubcategoriesForMainCategory
);

utility.app.post('/projects/initialize',
  utility.authenticateToken,
  // validation.validate(validationSchemas.initializeNewProject),
  projectActivities.InitializeNewProject
);

utility.app.post('/flags/ignore',
  utility.authenticateToken,
  validation.validate(validationSchemas.resolveAnomalyFlagAsIgnored),
  projectActivities.ResolveAnomalyFlagAsIgnored
);



utility.app.post('/validations/run',
  utility.authenticateToken,
  validation.validate(validationSchemas.runAllValidationsForScope),
  projectActivities.RunAllValidationsForScope
);

utility.app.post('/activities/batch',
  utility.authenticateToken,
  validation.validate(validationSchemas.upsertActivityDataBatch),
  projectActivities.UpsertActivityDataBatch
);

// Task Comments
utility.app.post('/task-comments/add',
  utility.authenticateToken,
  validation.validate(validationSchemas.addTaskComment),
  taskComments.AddCommentToTask
);

utility.app.get('/request/thread',
  utility.authenticateToken,
  validation.validate(validationSchemas.getRequestThreadDetails, 'query'),
  taskComments.GetRequestThreadDetails
);

// Templates
utility.app.post('/templates/create-custom',
  utility.authenticateToken,
  validation.validate(validationSchemas.createCustomTemplate),
  templates.CreateCustomTemplate
);

// temp1
utility.app.post('/templates/apply_template_to_project',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.apply_template_to_project
);

// temp2
utility.app.post('/templates/get_template_details_by_id',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.get_template_details_by_id
);




//temp3
utility.app.post('/get_subcategories_for_main_category',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.get_subcategories_for_main_category
);

//temp4
utility.app.post('/get_activities_for_subcategory',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.get_activities_for_subcategory
);

//temp5
utility.app.post('/get_selection1_for_activity',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.get_selection1_for_activity
);

//temp6
utility.app.post('/get_selection2_for_selection1',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.get_selection2_for_selection1
);

//temp7
utility.app.post('/get_emission_factor_for_selection',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.get_emission_factor_for_selection
);

//temp8
utility.app.post('/get_template_usage_percentage',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.get_template_usage_percentage
);


//temp9
utility.app.post('/save_project_activity_configuration',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.save_project_activity_configuration
);


//temp10
utility.app.post('/create_custom_template_from_scratch',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.create_custom_template_from_scratch
);


utility.app.post('/copy_template_to_staging_area',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.copy_template_to_staging_area
);

utility.app.post('/get_staged_activities_for_project',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.get_staged_activities_for_project
);


utility.app.post('/append_staged_activity_by_id',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.append_staged_activity_by_id
);

utility.app.post('/commit_staged_changes_to_project',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.commit_staged_changes_to_project
);


//temp10
utility.app.post('/create_custom_temp_template_from_scratch',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.create_custom_temp_template_from_scratch
);



utility.app.post('/run_all_validations_for_project',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.run_all_validations_for_project
);

utility.app.post('/get_project_review_data',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.get_project_review_data
);

utility.app.post('/submit_project_for_approval',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.submit_project_for_approval
);

utility.app.post('/get_approval_status_for_project',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.get_approval_status_for_project
);


utility.app.post('/upload_document_for_activity',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.upload_document_for_activity
);

//temp11
utility.app.post('/get_data_collection_sheet_for_scope',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.get_data_collection_sheet_for_scope
);



//temp12
utility.app.post('/getUnitById',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.getUnitById
);



//new
utility.app.post('/get_data_collection_sheet_for_scope',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.get_data_collection_sheet_for_scope
);



utility.app.post('/upsert_activity_data_batch',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.upsert_activity_data_batch
);


utility.app.post('/update_project_member_permission',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.createCustomTemplate),
  templates.update_project_member_permission
);









utility.app.get('/templates/details',
  utility.authenticateToken,
  validation.validate(validationSchemas.getTemplateDetailsById, 'query'),
  templates.GetTemplateDetailsById
);

// utility.app.get('/templates/list',  
utility.app.post('/templates/list',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.getTemplatesForUser, 'query'),
  templates.GetTemplatesForUser
);

utility.app.post('/project/apply-template',
  utility.authenticateToken,
  validation.validate(validationSchemas.applyTemplateToProject),
  projectActivities.ApplyTemplateToProject
);

utility.app.post('/project/save-activity-config',
  utility.authenticateToken,
  validation.validate(validationSchemas.saveProjectActivityConfiguration),
  projectActivities.SaveProjectActivityConfiguration
);

utility.app.post('/createNewFacility',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.saveProjectActivityConfiguration),
  upload.fields([
    { name: "p_id_document", maxCount: 1 },
    { name: "p_tax_document", maxCount: 1 },
    { name: "p_logo_url", maxCount: 1 }
  ]),
  facilities.createNewFacility
);


// _______________________________________________________________

//parameter :- 
// {
//   "p_org_id": 5
// }

utility.app.post('/get_assignable_users_for_org',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.saveProjectActivityConfiguration),
  projectActivities.get_assignable_users_for_org
);

// _______________________________________________________________




utility.app.put('/templates/update',
  utility.authenticateToken,
  validation.validate(validationSchemas.updateExistingCustomTemplate),
  templates.UpdateExistingCustomTemplate
);




utility.app.post('/getorg_name_and_id',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.saveProjectActivityConfiguration),
  facilities.getorg_name_and_id
);




utility.app.post('/add_new_member_to_project',
  // utility.authenticateToken,
  // validation.validate(validationSchemas.saveProjectActivityConfiguration),
  templates.add_new_member_to_project
);




utility.app.post('/remove_member_from_project',
  templates.remove_member_from_project
);


utility.app.post('/get_project_members_for_approval',
  templates.get_project_members_for_approval
);


utility.app.post('/get_available_users_for_project_team',
  templates.get_available_users_for_project_team
);

utility.app.post('/get_project_overall_completion',
  templates.get_project_overall_completion
);

utility.app.post('/search_auditors_to_add_to_project',
  templates.search_auditors_to_add_to_project
);


utility.app.post('/synchronize_project_approver',
  templates.synchronize_project_approver
);

utility.app.post('/create_new_project_request_with_file',
  upload.fields([
    { name: "p_file_url", maxCount: 1 }
  ]),
  templates.create_new_project_request_with_file
);

utility.app.post('/get_project_total_emissions_summary',
  templates.get_project_total_emissions_summary
);


utility.app.post('/get_project_monthly_summary',
  templates.get_project_monthly_summary
);


utility.app.post('/remove_project_auditor',
  templates.remove_project_auditor
);

utility.app.post('/recalculate_project_status',
  templates.recalculate_project_status
);

utility.app.post('/getAllProjectsByOrgID',
  templates.getAllProjectsByOrgID
);

utility.app.post('/getAllProjectsByFacilityID',
  templates.getAllProjectsByFacilityID
);

utility.app.post('/getUserInfoByUserID',
  templates.getUserInfoByUserID
);


utility.app.post('/get_project_category_totals',
  templates.get_project_category_totals
);


utility.app.post('/get_project_details_by_org',
  templates.get_project_details_by_org
);

utility.app.post('/project/get_user_project_request_summary',
  projectActivities.get_user_project_request_summary
);

utility.app.post('/project/get_project_portfolio_stats',
  projectActivities.get_project_portfolio_stats
);


utility.app.post('/get_project_portfolio_list',
  templates.get_project_portfolio_list
);


// utility.app.post('/get_project_portfolio_stats',
//   templates.get_project_portfolio_stats
// );


utility.app.post('/get_task_header',
  templates.get_task_header
);


utility.app.post('/get_assigned_tasks_for_user',
  templates.get_assigned_tasks_for_user
);



utility.app.post('/get_task_conversation',
  templates.get_task_conversation
);


utility.app.post('/add_task_comment',
  templates.add_task_comment
);

utility.app.post('/get_user_project_requests',
  templates.get_user_project_requests
);

utility.app.post('/get_all_facilities_for_parent_org_of_user',
  templates.get_all_facilities_for_parent_org_of_user
);

utility.app.post('/record_approver_decision',
  templates.record_approver_decision
);


utility.app.get('/getUnits',
  templates.getUnits
);

utility.app.post('/delete_staged_activity',
  templates.delete_staged_activity
);

utility.app.post('/update_staged_activity',
  templates.update_staged_activity
);


utility.app.post('/project/create',
  templates.CreateProject
);


// utility.app.post('/userlogout' ,                                    utility.authenticateToken,  register.userlogout);














// ______________Upload Functionality________________________________






const csv = require("csv-parser");
const multer = require("multer");


const upload2 = multer({ storage: multer.memoryStorage() });


const { Readable } = require("stream");

utility.app.post("/upload-csv", upload2.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File not found" });
    }

    let raw = req.file.buffer.toString("utf8")
      .replace(/^\uFEFF/, "")
      .replace(/\u00A0/g, " ");

    const delimiter = raw.includes("\t") ? "\t" : ",";

    const results = [];

    const cleanKey = (str = "") =>
      str
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s]+/g, " ")
        .replace(/[_-]+/g, "_")
        .trim();

    const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    const formatToMonth = (key = "") => {
      const match = key.match(/([A-Za-z]{3})[_\s-]?(\d{2,4})/);
      if (!match) return null;
      let month = match[1].toUpperCase();
      let year = match[2];
      if (!MONTHS.includes(month)) return null;
      month = month.charAt(0) + month.slice(1).toLowerCase();
      return `${month} ${year}`;
    };


    Readable.from(raw)
      .pipe(
        csv({
          separator: delimiter,
          mapHeaders: ({ header }) =>
            header
              .normalize("NFKD")
              .toLowerCase()
              .replace(/[^\w\s]/g, " ")
              .replace(/[\s]+/g, "_")
              .trim()
        })
      )
      .on("data", (row) => {
        const clean = {};
        Object.keys(row).forEach((k) => {
          const key = cleanKey(k);
          clean[key] = (row[k] || "").toString().trim();
        });

        const obj = {
          project_activity_id: Number(clean.project_activity_id) || null,
          main_category: clean.main_category || "",
          sub_category: clean.sub_category || "",
          activity: clean.activity || "",
          selection_1: clean.selection_1 || "",
          selection_2: clean.selection_2 || "",
          unit: clean.unit || "",
          monthly_data: {},
          subcategory_id: Number(clean.subcategory_id) || 0
        };

        Object.keys(clean).forEach((key) => {
          if (
            ![
              "project_activity_id",
              "main_category",
              "sub_category",
              "activity",
              "selection_1",
              "selection_2",
              "unit"
            ].includes(key)
          ) {
            const month = formatToMonth(key);
            if (month && clean[key] !== "") {
              obj.monthly_data[month] = {
                quantity: Number(clean[key]) || 0
              };
            }
          }
        });

        results.push(obj);
      })
      .on("end", () => {
        res.json({
          issuccessful: true,
          message: "Data Parsed successfully",
          data: {
            templates: results,
            count: results.length
          }
        });
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      issuccessful: false,
      message: "Internal server error",
      error: err.message
    });
  }
});






//old formate

// const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

// utility.app.post("/generate_pdf", async (req, res) => {
//   try {
//     const body = req.body && Object.keys(req.body).length ? req.body : {};

//     // No defaults - use only what's sent in the request
//     const payload = {
//       reportingPeriod: body.reportingPeriod,
//       criteria: body.criteria,
//       otherSources: body.otherSources,
//       rows: body.rows || []
//     };

//     const pdfDoc = await PDFDocument.create();
//     const page = pdfDoc.addPage([842, 595]);
//     const { width, height } = page.getSize();

//     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//     const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//     // ============================
//     // WATERMARK - "bsi." in center
//     // ============================
//     // const watermarkText = "bsi.";
//     const watermarkText = "verified";
//     const watermarkSize = 180;
//     const watermarkX = width / 2 - 100;
//     const watermarkY = height / 2 - 50;

//     page.drawText(watermarkText, {
//       x: watermarkX,
//       y: watermarkY,
//       size: watermarkSize,
//       font: fontBold,
//       color: rgb(0.85, 0.85, 0.85),
//       opacity: 0.3,
//     });

//     // ============================
//     // HEADER "bsi."
//     // ============================
//     // page.drawText("bsi", {
//     page.drawText("carbon scan.ai", {
//       x: 40,
//       y: 545,
//       size: 44,
//       font: fontBold,
//       color: rgb(0, 0, 0),
//     });

//     // Draw the red dot after "bsi"
//     page.drawCircle({
//       // x: 125,
//       x: 350,
//       y: 551,
//       size: 4,
//       color: rgb(0.9, 0.1, 0.1),
//     });

//     // ============================
//     // TOP INFO TABLE (Dynamic rows based on what's provided)
//     // ============================
//     const topTableX = 105;
//     const topTableY = 500;
//     const topTableWidth = width - 145;
//     const topRowHeight = 26;

//     // Build table data only from provided fields
//     const topTableData = [];

//     if (payload.otherSources !== undefined && payload.otherSources !== null) {
//       topTableData.push(["Indirect GHG emissions from\nother sources", payload.otherSources]);
//     }

//     if (payload.criteria !== undefined && payload.criteria !== null) {
//       topTableData.push(["Criteria for developing the organizational\nGHG Inventory:", payload.criteria]);
//     }

//     if (payload.reportingPeriod !== undefined && payload.reportingPeriod !== null) {
//       topTableData.push(["Reporting Period", payload.reportingPeriod]);
//     }

//     // Only draw top table if there's data
//     if (topTableData.length > 0) {
//       // Draw outer rectangle
//       page.drawRectangle({
//         x: topTableX,
//         y: topTableY - topRowHeight * topTableData.length,
//         width: topTableWidth,
//         height: topRowHeight * topTableData.length,
//         borderWidth: 1,
//         borderColor: rgb(0, 0, 0),
//       });

//       // Draw horizontal lines
//       for (let i = 1; i < topTableData.length; i++) {
//         page.drawLine({
//           start: { x: topTableX, y: topTableY - topRowHeight * i },
//           end: { x: topTableX + topTableWidth, y: topTableY - topRowHeight * i },
//           thickness: 1,
//           color: rgb(0, 0, 0),
//         });
//       }

//       // Draw vertical line separating columns
//       const topColSplit = topTableX + topTableWidth * 0.45;
//       page.drawLine({
//         start: { x: topColSplit, y: topTableY },
//         end: { x: topColSplit, y: topTableY - topRowHeight * topTableData.length },
//         thickness: 1,
//         color: rgb(0, 0, 0),
//       });

//       // Draw content
//       for (let i = 0; i < topTableData.length; i++) {
//         const yPos = topTableY - topRowHeight * i - 17;

//         // Left column text
//         const leftLines = topTableData[i][0].split('\n');
//         leftLines.forEach((line, idx) => {
//           page.drawText(line, {
//             x: topTableX + 8,
//             y: yPos + (leftLines.length > 1 ? 6 - idx * 10 : 0),
//             size: 12,
//             font,
//             color: rgb(0, 0, 0),
//           });
//         });

//         // Right column text
//         page.drawText(String(topTableData[i][1]), {
//           x: topColSplit + 8,
//           y: yPos,
//           size: 12,
//           font,
//           color: rgb(0, 0, 0),
//         });
//       }
//     }

//     // ============================
//     // MAIN EMISSIONS TABLE (Only if rows exist)
//     // ============================
//     if (payload.rows.length > 0) {
//       const mainTableX = 105;
//       const startTableY = 410;
//       let mainTableY = startTableY;
//       const mainTableWidth = topTableWidth;
//       const mainRowHeight = 18.5;
//       const labelColWidth = mainTableWidth * 0.72;
//       const valueColX = mainTableX + labelColWidth;

//       // Draw outer border
//       const tableStartY = mainTableY;
//       const totalRows = payload.rows.length + 1; // +1 for header

//       page.drawRectangle({
//         x: mainTableX,
//         y: mainTableY - mainRowHeight * totalRows,
//         width: mainTableWidth,
//         height: mainRowHeight * totalRows,
//         borderWidth: 1,
//         borderColor: rgb(0, 0, 0),
//       });

//       // Draw vertical line separating columns
//       page.drawLine({
//         start: { x: valueColX, y: tableStartY },
//         end: { x: valueColX, y: mainTableY - mainRowHeight * totalRows },
//         thickness: 1,
//         color: rgb(0, 0, 0),
//       });

//       // Draw header row
//       page.drawLine({
//         start: { x: mainTableX, y: mainTableY },
//         end: { x: mainTableX + mainTableWidth, y: mainTableY },
//         thickness: 1,
//         color: rgb(0, 0, 0),
//       });

//       page.drawText("tCO2e", {
//         x: valueColX + 10,
//         y: mainTableY - 15,
//         size: 12,
//         font: fontBold,
//       });

//       mainTableY -= mainRowHeight;

//       // Draw all data rows
//       for (let i = 0; i < payload.rows.length; i++) {
//         const row = payload.rows[i];

//         // Draw gray background for header rows (before borders)
//         if (row.grayBg) {
//           page.drawRectangle({
//             x: mainTableX,
//             y: mainTableY - mainRowHeight,
//             width: mainTableWidth,
//             height: mainRowHeight,
//             color: rgb(0.75, 0.75, 0.75),
//           });
//         }

//         // Draw horizontal line
//         page.drawLine({
//           start: { x: mainTableX, y: mainTableY },
//           end: { x: mainTableX + mainTableWidth, y: mainTableY },
//           thickness: 0.5,
//           color: rgb(0, 0, 0),
//         });

//         // Only bold for rows where bold: true
//         const useBold = row.bold === true;
//         const useFont = useBold ? fontBold : font;

//         // Draw label
//         page.drawText(String(row.label), {
//           x: mainTableX + 6,
//           y: mainTableY - 14,
//           size: 12,
//           font: useFont,
//         });

//         // Draw value (only if not empty)
//         if (row.value !== "" && row.value !== null && row.value !== undefined) {
//           const formattedValue = Number(row.value).toLocaleString("en-US", {
//             minimumFractionDigits: 1,
//             maximumFractionDigits: 1,
//           });

//           page.drawText(formattedValue, {
//             x: valueColX + 10,
//             y: mainTableY - 14,
//             size: 9,
//             font: useFont,
//           });
//         }

//         mainTableY -= mainRowHeight;
//       }
//     }

//     const pdfBytes = await pdfDoc.save();

//     // Generate filename with timestamp
//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     const filename = `GHG-Emissions-Report-${timestamp}.pdf`;

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
//     res.setHeader("Content-Length", pdfBytes.length);

//     res.send(Buffer.from(pdfBytes));
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "PDF generation failed", detail: err.message });
//   }
// });




 

 
 

 

 








 



 


const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fetch = require("node-fetch");

utility.app.post("/generate_pdf", async (req, res) => {
  try {
    const data = req.body || {};

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Light blue color for table headers
    const lightBlue = rgb(0.678, 0.847, 0.902); // Light blue #ADD8E6
    const black = rgb(0, 0, 0);
    const white = rgb(1, 1, 1);

    // ============================================
    // PAGE 1: TITLE PAGE
    // ============================================
    const page1 = pdfDoc.addPage([595, 842]); // A4 portrait
    let y = 760;

// Title - Centered
const title = "Greenhouse Gas Emissions Inventory";
const titleWidth = fontBold.widthOfTextAtSize(title, 18);
page1.drawText(title, {
  x: (595 - titleWidth) / 2, // Center horizontally
  y,
  size: 18,
  font: fontBold,
  color: black
});

    y -= 40;
// Company Name - Centered
const companyName = data.companyName || "[COMPANY NAME]";
const companyWidth = fontBold.widthOfTextAtSize(companyName, 14);
page1.drawText(companyName, {
  x: (595 - companyWidth) / 2, // Center horizontally
  y,
  size: 14,
  font: fontBold,
  color: black
});

    y -= 30;
const inventoryYear = data.inventoryYear || "[INVENTORY YEAR]";
const yearWidth = fontBold.widthOfTextAtSize(inventoryYear, 14);
page1.drawText(inventoryYear, {
  x: (595 - yearWidth) / 2, // Center horizontally
  y,
  size: 14,
  font: fontBold,
  color: black
});

 

        
 // Company Logo Box with Image
y -= 50;

if (data.companyLogoUrl) {
  try {
    console.log("Fetching logo from:", data.companyLogoUrl);
    
    // Fetch the image
    const response = await fetch(data.companyLogoUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const imageBytes = new Uint8Array(arrayBuffer);
    
    // Determine image type and embed
    let logoImage;
    const url = data.companyLogoUrl.toLowerCase();
    
    if (url.endsWith('.png') || url.includes('.png?') || url.includes('format=png')) {
      logoImage = await pdfDoc.embedPng(imageBytes);
    } else if (url.endsWith('.jpg') || url.endsWith('.jpeg') || 
               url.includes('.jpg?') || url.includes('.jpeg?') ||
               url.includes('format=jpg') || url.includes('format=jpeg')) {
      logoImage = await pdfDoc.embedJpg(imageBytes);
    } else {
      // Try PNG first, then JPG
      try {
        logoImage = await pdfDoc.embedPng(imageBytes);
      } catch {
        logoImage = await pdfDoc.embedJpg(imageBytes);
      }
    }

    // Calculate dimensions to fit in the box
    const boxWidth = 495;
    const boxHeight = 80;
    const imgDims = logoImage.scale(1);
    
    // Calculate scaling to fit image in box while maintaining aspect ratio
    const scaleX = (boxWidth - 20) / imgDims.width;
    const scaleY = (boxHeight - 20) / imgDims.height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't upscale
    
    const scaledWidth = imgDims.width * scale;
    const scaledHeight = imgDims.height * scale;
    
    // Center the image in the box
    const imgX = 50 + (boxWidth - scaledWidth) / 2;
    const imgY = y - 80 + (boxHeight - scaledHeight) / 2;

    // NO BORDER - Just draw the logo directly
    page1.drawImage(logoImage, {
      x: imgX,
      y: imgY,
      width: scaledWidth,
      height: scaledHeight
    });
    
    console.log("Logo embedded successfully");
  } catch (error) {
    console.error("Error embedding logo:", error.message);
    // Fallback to placeholder text WITH border if image fails
    page1.drawRectangle({
      x: 50,
      y: y - 80,
      width: 495,
      height: 80,
      borderWidth: 1,
      borderColor: black
    });
    page1.drawText("COMPANY", {
      x: 270,
      y: y - 30,
      size: 12,
      font: fontBold
    });
    page1.drawText("LOGO", {
      x: 280,
      y: y - 50,
      size: 12,
      font: fontBold
    });
    page1.drawText("(Failed to load image)", {
      x: 240,
      y: y - 65,
      size: 8,
      font
    });
  }
} else {
  // No logo provided - show placeholder WITH border
  page1.drawRectangle({
    x: 50,
    y: y - 80,
    width: 495,
    height: 80,
    borderWidth: 1,
    borderColor: black
  });
  page1.drawText("COMPANY", {
    x: 270,
    y: y - 30,
    size: 12,
    font: fontBold
  });
  page1.drawText("LOGO", {
    x: 280,
    y: y - 50,
    size: 12,
    font: fontBold
  });
}


    // ============================================
// Verification Table (Header + Yes/No inside)
// ============================================
y -= 120;

// Table Header
page1.drawRectangle({
  x: 50,
  y: y - 30,
  width: 495,
  height: 30,
  color: lightBlue,
  borderWidth: 1,
  borderColor: black
});

// Centered Header Text
const verHeader = "Has this inventory been verified by an accredited third party?";
const hdrWidth = fontBold.widthOfTextAtSize(verHeader, 10);
page1.drawText(verHeader, {
  x: 50 + (495 - hdrWidth) / 2,
  y: y - 22,
  size: 10,
  font: fontBold
});
y -= 30;

// Yes / No Options Row (boxed)
const optionHeight = 25;
page1.drawRectangle({
  x: 50,
  y: y - optionHeight,
  width: 495,
  height: optionHeight,
  borderWidth: 1,
  borderColor: black
});

// Draw choices
page1.drawText(
  data.verified ? "[ ] No" : "[ ] No",
  { x: 70, y: y - 17, size: 10, font }
);

page1.drawText(
  data.verified
    ? "[ ] Yes (if yes, fill verification information below)"
    : "[ ] Yes (if yes, fill verification information below)",
  { x: 200, y: y - 17, size: 10, font }
);

y -= optionHeight + 15;

// If YES → Show Verification Details Table
if (data.verified) {
  const verificationRows = [
    { label: "Date of verification:", value: data.verificationDate || "MM/DD/YYYY" },
    { label: "Verifier:", value: data.verifier || "" },
    { label: "Email:", value: data.verifierEmail || "" },
    { label: "Phone:", value: data.verifierPhone || "" },
    { label: "Address:", value: data.verifierAddress || "" }
  ];
  drawSimpleTable(page1, 50, y, 495, verificationRows, font, fontBold);
  y -= verificationRows.length * 25 + 20;
} else {
  y -= 20;
}






    // Exclusions
 y -= 20;
drawSingleRowTable(
  page1,
  50,
  y,
  495,
  "Have any facilities, operations and/or emissions sources been excluded from this inventory? If yes, please specify.",
  data.exclusions || "",
  font,
  fontBold,
  lightBlue
);

    // Reporting Period
    y -= 60;
    const periodText = `From ${data.periodFrom || "MM/DD/YYYY"} to ${
      data.periodTo || "MM/DD/YYYY"
    }`;
    drawTableWithBlueHeader(
      page1,
      50,
      y,
      495,
      [
        {
          label: "Reporting period covered by this inventory",
          value: "",
          isHeader: true
        },
        { label: periodText, value: "", isData: true }
      ],
      font,
      fontBold,
      lightBlue
    );

    // ============================================
    // PAGE 2: ORGANIZATIONAL & OPERATIONAL BOUNDARIES
    // ============================================
    const page2 = pdfDoc.addPage([595, 842]);
    y = 760;

    page2.drawText("ORGANIZATIONAL BOUNDARIES", {
      x: 50,
      y,
      size: 14,
      font: fontBold
    });

    y -= 40;
    const consolidationText = [
      "Which consolidation approach was chosen (check each consolidation approach",
      "for which your company is reporting emissions.)",
      "",
      "If your company is reporting according to more than one consolidation approach,",
      "please complete and attach an additional completed reporting template that",
      "provides your company's emissions data following the other consolidation approach(es)."
    ];

    // Calculate header height
const headerHeight = consolidationText.length * 12 + 10;

// Draw blue header background
page2.drawRectangle({
  x: 50,
  y: y - headerHeight,
  width: 495,
  height: headerHeight,
  color: lightBlue,
  borderWidth: 1,
  borderColor: black
});

// Draw header text
consolidationText.forEach((line, idx) => {
  page2.drawText(line, { 
    x: 55, 
    y: y - 15 - (idx * 12), 
    size: 9, 
    font: fontBold 
  });
});

y -= headerHeight;

// Single row with all three checkboxes
const checkboxRowHeight = 30;
page2.drawRectangle({
  x: 50,
  y: y - checkboxRowHeight,
  width: 495,
  height: checkboxRowHeight,
  borderWidth: 1,
  borderColor: black
});

// Draw all three options in one row
const option1 = data.equityShare ? "[  ] Equity Share" : "[ ] Equity Share";
const option2 = data.financialControl ? "[  ] Financial Control" : "[ ] Financial Control";
const option3 = data.operationalControl ? "[  ] Operational Control" : "[ ] Operational Control";

page2.drawText(option1, {
  x: 70,
  y: y - 20,
  size: 10,
  font
});

page2.drawText(option2, {
  x: 220,
  y: y - 20,
  size: 10,
  font
});

page2.drawText(option3, {
  x: 390,
  y: y - 20,
  size: 10,
  font
});

y -= checkboxRowHeight + 20;





 
  

    // y -= 60;
    page2.drawText("OPERATIONAL BOUNDARIES", {
      x: 50,
      y,
      size: 14,
      font: fontBold
    });

    y -= 35;
    drawTableWithBlueHeader(
      page2,
      50,
      y,
      495,
      [
        {
          label: "Are Scope 3 emissions included in this inventory?",
          value: "",
          isHeader: true
        },
        {
          label: data.scope3Included ? "[  ] yes  [ ] no" : "[ ] yes  [  ] no",
          value: "",
          isData: true
        }
      ],
      font,
      fontBold,
      lightBlue
    );

    


    // Replace this part in your OPERATIONAL BOUNDARIES section:

y -= 80;

// Single header with blue background (no two columns)
const scope3HeaderHeight = 30;

page2.drawRectangle({
  x: 50,
  y: y - scope3HeaderHeight,
  width: 495,
  height: scope3HeaderHeight,
  color: lightBlue,
  borderWidth: 1,
  borderColor: black
});

page2.drawText(
  "If yes, which types of activities are included in Scope 3 emissions?",
  {
    x: 55,
    y: y - 20,
    size: 10,
    font: fontBold,
    maxWidth: 485
  }
);

y -= scope3HeaderHeight;

// Value row beneath the header
const valueRowHeight = 50;

page2.drawRectangle({
  x: 50,
  y: y - valueRowHeight,
  width: 495,
  height: valueRowHeight,
  borderWidth: 1,
  borderColor: black
});

if (data.scope3Activities) {
  page2.drawText(String(data.scope3Activities), {
    x: 55,
    y: y - 15,
    size: 9,
    font,
    maxWidth: 485
  });
}

y -= valueRowHeight + 10;



    // Main Emissions Table
    y -= 80;
    page2.drawText("INFORMATION ON EMISSIONS", {
      x: 50,
      y,
      size: 14,
      font: fontBold
    });
    y -= 20;
    page2.drawText(
      "The table below refers to emissions independent of any GHG trades such as",
      { x: 50, y, size: 9, font }
    );
    y -= 12;
    page2.drawText(
      "sales, purchases, transfers, or banking of allowances",
      { x: 50, y, size: 9, font }
    );

    y -= 25;
    drawEmissionsTable(
      page2,
      50,
      y,
      495,
      data.emissions || {},
      font,
      fontBold,
      lightBlue
    );

    y -= 115;
    drawTableWithBlueHeader(
      page2,
      50,
      y,
      495,
      [
        {
          label:
            "Direct CO2 emissions from Biogenic combustion (mtCO2)",
          value: data.biogenicEmissions || "",
          isHeader: true
        }
      ],
      font,
      fontBold,
      lightBlue
    );

    // ============================================
    // PAGE 3: BASE YEAR & METHODOLOGIES
    // ============================================
     
const page3 = pdfDoc.addPage([595, 842]);
y = 760;

page3.drawText("BASE YEAR", {
  x: 50,
  y,
  size: 14,
  font: fontBold
});

y -= 35;

// Year chosen as base year
drawSingleRowTable(
  page3,
  50,
  y,
  495,
  "Year chosen as base year",
  data.baseYear || "",
  font,
  fontBold,
  lightBlue
);

y -= 80;

// Clarification of company-determined policy
drawSingleRowTable(
  page3,
  50,
  y,
  495,
  "Clarification of company-determined policy for making base year emissions recalculations",
  data.baseYearPolicy || "",
  font,
  fontBold,
  lightBlue
);

y -= 80;

// Context for significant emissions changes
drawSingleRowTable(
  page3,
  50,
  y,
  495,
  "Context for any significant emissions changes that trigger base year emissions recalculations",
  data.baseYearContext || "",
  font,
  fontBold,
  lightBlue
);

y -= 80;

// Base year emissions header
drawTableWithBlueHeader(
  page3,
  50,
  y,
  495,
  [
    {
      label: "Base year emissions",
      value: "",
      isHeader: true
    }
  ],
  font,
  fontBold,
  lightBlue
);

y -= 40;
drawEmissionsTable(
  page3,
  50,
  y,
  495,
  data.baseYearEmissions || {},
  font,
  fontBold,
  lightBlue
);

y -= 140;
page3.drawText("METHODOLOGIES AND EMISSION FACTORS", {
  x: 50,
  y,
  size: 14,
  font: fontBold
});

y -= 35;
drawSingleRowTable(
  page3,
  50,
  y,
  495,
  "Methodologies used to calculate or measure emissions other than those provided by the GHG Protocol. (Provide a reference or link to any non-GHG Protocol calculation tools used)",
  data.methodologies || "",
  font,
  fontBold,
  lightBlue
);

    // ============================================
    // PAGE 4: DETAILED EMISSIONS & ORG TABLE
    // ============================================
    const page4 = pdfDoc.addPage([595, 842]);
    y = 760;

    page4.drawText("ORGANIZATIONAL BOUNDARIES", {
      x: 50,
      y,
      size: 14,
      font: fontBold
    });

    y -= 35;
    drawOrganizationalTable(
      page4,
      50,
      y,
      495,
      data.organizationalBoundaries || [],
      font,
      fontBold,
      lightBlue
    );

 


y -= 150;
drawSingleRowTable(
  page4,
  50,
  y,
  495,
  "If the reporting company's parent company does not report emissions, include an organizational diagram that clearly defines relationship of the reporting subsidiary as well as other subsidiaries",
  data.organizationalDiagram || "",
  font,
  fontBold,
  lightBlue
);

y -= 120; // Increased spacing from 80 to 100

page4.drawText("INFORMATION ON EMISSIONS", {
  x: 50,
  y,
  size: 14,
  font: fontBold
});

y -= 35;

const detailedEmissions = [
  { label: "Emissions disaggregated by source types", value: "", isHeader: true },
  {
    label: "Scope 1: Direct Emissions from Owned/Controlled Operations",
    value: "",
    subHeader: true
  },
  {
    label: "a. Direct Emissions from Stationary Combustion",
    value: data.stationaryCombustion || ""
  },
  {
    label: "b. Direct Emissions from Mobile Combustion",
    value: data.mobileCombustion || ""
  },
  {
    label: "c. Direct Emissions from Process Sources",
    value: data.processSources || ""
  },
  {
    label: "d. Direct Emissions from Fugitive Sources",
    value: data.fugitiveSources || ""
  },
  {
    label: "e. Direct Emissions from Agricultural Sources",
    value: data.agriculturalSources || ""
  },
  {
    label:
      "Scope 2: Indirect Emissions from the Use of Purchased Electricity, Steam, Heating and Cooling",
    value: "",
    subHeader: true
  },
  {
    label: "a. Indirect Emissions from Purchased/Acquired Electricity",
    value: data.electricity || ""
  },
  {
    label: "b. Indirect Emissions from Purchased/Acquired Steam",
    value: data.steam || ""
  },
  {
    label: "c. Indirect Emissions from Purchased/Acquired Heating",
    value: data.heating || ""
  },
  {
    label: "d. Indirect Emissions from Purchased/Acquired Cooling",
    value: data.cooling || ""
  }
];

drawDetailedEmissionsTable(
  page4,
  50,
  y,
  495,
  detailedEmissions,
  font,
  fontBold,
  lightBlue
);

    // ============================================
    // PAGE 5: FURTHER EMISSIONS INFORMATION
    // ============================================
  const page5 = pdfDoc.addPage([595, 842]);
y = 760;

page5.drawText("INFORMATION ON EMISSIONS", {
  x: 50,
  y,
  size: 14,
  font: fontBold
});

y -= 40;

// Facility table with header
drawFacilityTableWithHeader(
  page5,
  50,
  y,
  495,
  "Emissions disaggregated by facility (recommended for individual facilities with stationary combustion emissions over 10,000 mtCO2e)",
  data.facilityEmissions || [],
  font,
  fontBold,
  lightBlue
);
y -= 120;

// Country table with header
drawCountryTableWithHeader(
  page5,
  50,
  y,
  495,
  "Emissions disaggregated by country",
  data.countryEmissions || [],
  font,
  fontBold,
  lightBlue
);
y -= 120;

// Single row tables for the remaining fields
drawSingleRowTable(
  page5,
  50,
  y,
  495,
  "Emissions attributable to own generation of electricity, heat, or steam that is sold or transferred to another organization",
  data.ownGenerationEmissions || "",
  font,
  fontBold,
  lightBlue
);
y -= 80;

drawSingleRowTable(
  page5,
  50,
  y,
  495,
  "Emissions attributable to the generation of electricity, heat or steam that is purchased for re-sale to non-end users",
  data.purchasedForResaleEmissions || "",
  font,
  fontBold,
  lightBlue
);
y -= 80;

drawSingleRowTable(
  page5,
  50,
  y,
  495,
  "Emissions from GHGs not covered by the Kyoto Protocol (e.g., CFCs, NOx)",
  data.nonKyotoEmissions || "",
  font,
  fontBold,
  lightBlue
);

// ============================================
// PAGE 6: EMISSIONS CONTEXT & TRENDS
// ============================================
const page6 = pdfDoc.addPage([595, 842]);
y = 760;

page6.drawText("INFORMATION ON EMISSIONS", {
  x: 50,
  y,
  size: 14,
  font: fontBold
});

y -= 40;

drawSingleRowTable(
  page6,
  50,
  y,
  495,
  "Information on the causes of emissions changes that did not trigger a base year emissions recalculation (e.g., process changes, efficiency improvements, plant closures)",
  data.emissionChangeCauses || "",
  font,
  fontBold,
  lightBlue
);
y -= 80;

drawSingleRowTable(
  page6,
  50,
  y,
  495,
  "GHG emissions data for all years between the base year and the reporting year (including details of and reasons for recalculations, if appropriate)",
  data.historicalEmissions || "",
  font,
  fontBold,
  lightBlue
);
y -= 80;

drawSingleRowTable(
  page6,
  50,
  y,
  495,
  "Relevant ratio performance indicators (e.g. emissions per kilowatt-hour generated, sales, etc.)",
  data.performanceIndicators || "",
  font,
  fontBold,
  lightBlue
);
y -= 80;

drawSingleRowTable(
  page6,
  50,
  y,
  495,
  "An outline of any GHG management/reduction programs or strategies",
  data.managementPrograms || "",
  font,
  fontBold,
  lightBlue
);
    // ============================================
    // PAGE 7: ADDITIONAL INFORMATION
    // ============================================
 const page7 = pdfDoc.addPage([595, 842]);
y = 760;

page7.drawText("ADDITIONAL INFORMATION", {
  x: 50,
  y,
  size: 14,
  font: fontBold
});

y -= 40;

// First field
drawSingleRowTable(
  page7,
  50,
  y,
  495,
  "Information on any contractual provisions addressing GHG-related risks and obligations",
  data.contractualProvisions || "",
  font,
  fontBold,
  lightBlue
);
y -= 80;

// Second field
drawSingleRowTable(
  page7,
  50,
  y,
  495,
  "An outline of any external assurance provided and a copy of any verification statement, if applicable, of the reported emissions data",
  data.externalAssurance || "",
  font,
  fontBold,
  lightBlue
);
y -= 80;

// Third field
drawSingleRowTable(
  page7,
  50,
  y,
  495,
  "Information on the quality of the inventory (e.g., information on the causes and magnitude of uncertainties in emission estimates) and an outline of policies in place to improve inventory quality",
  data.inventoryQuality || "",
  font,
  fontBold,
  lightBlue
);
y -= 80;

// Fourth field
drawSingleRowTable(
  page7,
  50,
  y,
  495,
  "Information on any GHG sequestration",
  data.sequestrationInfo || "",
  font,
  fontBold,
  lightBlue
);

    // ============================================
    // PAGE 8: INFORMATION ON OFFSETS
    // ============================================
  // ============================================
// PAGE 8: INFORMATION ON OFFSETS
// ============================================
const page8 = pdfDoc.addPage([595, 842]);
y = 760;

page8.drawText("INFORMATION ON OFFSETS", {
  x: 50,
  y,
  size: 14,
  font: fontBold
});

y -= 40;

// First table with header
drawOffsetsTableWithHeader(
  page8,
  50,
  y,
  495,
  "Information on offsets that have been purchased or developed outside the inventory boundary",
  data.offsetsOutsideBoundary || [],
  font,
  fontBold,
  lightBlue
);

y -= 120; // Adjust spacing based on table height

// Second table with header
drawOffsetsTableWithHeader(
  page8,
  50,
  y,
  495,
  "Information on reductions inside the inventory boundary that have been sold/transferred as offsets to a third party",
  data.offsetsInsideBoundary || [],
  font,
  fontBold,
  lightBlue
);

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    function drawTableWithBlueHeader(
      page,
      x,
      y,
      width,
      rows,
      font,
      fontBold,
      blueColor
    ) {
      // const rowHeight = 30;
      // If isHeader AND has value (textarea needed) → bigger box
const rowHeight = rows.isHeader && rows.value !== "" ? 80 : 30;

      let currentY = y;

      rows.forEach((row) => {
        // Draw rectangle
        page.drawRectangle({
          x,
          y: currentY - rowHeight,
          width,
          height: rowHeight,
          borderWidth: 1,
          borderColor: black,
          color: row.isHeader ? blueColor : white
        });

        // Draw text
        const textFont = row.isHeader ? fontBold : font;
        const textSize = row.isHeader ? 10 : 9;

        if (row.value) {
          // Two column layout
          const colSplit = width * 0.6;
          page.drawText(row.label, {
            x: x + 5,
            y: currentY - 18,
            size: textSize,
            font: textFont,
            maxWidth: colSplit - 10
          });
          page.drawText(String(row.value), {
            x: x + colSplit + 5,
            y: currentY - 18,
            size: 9,
            font,
            maxWidth: width - colSplit - 10
          });

          // Vertical line
          page.drawLine({
            start: { x: x + colSplit, y: currentY },
            end: { x: x + colSplit, y: currentY - rowHeight },
            thickness: 1,
            color: black
          });
        } else {
          // Full width text
          page.drawText(row.label, {
            x: x + 5,
            y: currentY - 18,
            size: textSize,
            font: textFont,
            maxWidth: width - 10
          });
        }

        currentY -= rowHeight;
      });
    }

    function drawSimpleTable(page, x, y, width, rows, font, fontBold) {
      const rowHeight = 25;
      const colSplit = width * 0.35;
      let currentY = y;

      // Draw outer border
      page.drawRectangle({
        x,
        y: currentY - rowHeight * rows.length,
        width,
        height: rowHeight * rows.length,
        borderWidth: 1,
        borderColor: black
      });

      // Draw vertical line
      page.drawLine({
        start: { x: x + colSplit, y: currentY },
        end: { x: x + colSplit, y: currentY - rowHeight * rows.length },
        thickness: 1,
        color: black
      });

      rows.forEach((row, idx) => {
        if (idx > 0) {
          page.drawLine({
            start: { x, y: currentY },
            end: { x: x + width, y: currentY },
            thickness: 1,
            color: black
          });
        }

        page.drawText(row.label, {
          x: x + 5,
          y: currentY - 16,
          size: 9,
          font: fontBold
        });

        page.drawText(String(row.value), {
          x: x + colSplit + 5,
          y: currentY - 16,
          size: 9,
          font
        });

        currentY -= rowHeight;
      });
    }

    function drawEmissionsTable(
      page,
      x,
      y,
      width,
      emissions,
      font,
      fontBold,
      blueColor
    ) {
      const headers = [
        "EMISSIONS",
        "TOTAL\n(mt CO2e)",
        "CO2\n(mt)",
        "CH4\n(mt)",
        "N2O\n(mt)",
        "HFCs\n(mt)",
        "PFCs\n(mt)",
        "SF6\n(mt)"
      ];
      const colWidth = width / 8;
      const rowHeight = 30;
      let currentY = y;

      // Draw header row with blue background
      page.drawRectangle({
        x,
        y: currentY - rowHeight,
        width,
        height: rowHeight,
        color: blueColor,
        borderWidth: 1,
        borderColor: black
      });

      headers.forEach((header, idx) => {
        const lines = header.split("\n");
        lines.forEach((line, lineIdx) => {
          page.drawText(line, {
            x: x + idx * colWidth + 3,
            y: currentY - 12 - lineIdx * 10,
            size: 8,
            font: fontBold
          });
        });

        if (idx > 0) {
          page.drawLine({
            start: { x: x + idx * colWidth, y: currentY },
            end: { x: x + idx * colWidth, y: currentY - rowHeight * 4 },
            thickness: 0.5,
            color: black
          });
        }
      });

      currentY -= rowHeight;

      // Data rows
      const rows = [
        [
          "Scope 1",
          emissions.scope1Total,
          emissions.scope1CO2,
          emissions.scope1CH4,
          emissions.scope1N2O,
          emissions.scope1HFCs,
          emissions.scope1PFCs,
          emissions.scope1SF6
        ],
        [
          "Scope 2",
          emissions.scope2Total,
          emissions.scope2CO2,
          emissions.scope2CH4,
          emissions.scope2N2O,
          emissions.scope2HFCs,
          emissions.scope2PFCs,
          emissions.scope2SF6
        ],
        [
          "Scope 3\n(OPTIONAL)",
          emissions.scope3Total,
          emissions.scope3CO2,
          emissions.scope3CH4,
          emissions.scope3N2O,
          emissions.scope3HFCs,
          emissions.scope3PFCs,
          emissions.scope3SF6
        ]
      ];

      rows.forEach((row) => {
        page.drawRectangle({
          x,
          y: currentY - rowHeight,
          width,
          height: rowHeight,
          borderWidth: 1,
          borderColor: black
        });

        row.forEach((cell, colIdx) => {
          if (cell) {
            const lines = String(cell).split("\n");
            lines.forEach((line, lineIdx) => {
              page.drawText(line, {
                x: x + colIdx * colWidth + 3,
                y: currentY - 18 - lineIdx * 10,
                size: 8,
                font
              });
            });
          }
        });

        currentY -= rowHeight;
      });
    }
 
    function drawOrganizationalTable(
  page,
  x,
  y,
  width,
  boundaries,
  font,
  fontBold,
  blueColor
) {
  const colWidths = [
    width * 0.4,
    width * 0.2,
    width * 0.2,
    width * 0.2
  ];
  const headerHeight = 50; // Increased from 30 to accommodate 4 lines
  const dataRowHeight = 30;
  let currentY = y;

  // Header row
  page.drawRectangle({
    x,
    y: currentY - headerHeight,
    width,
    height: headerHeight,
    color: blueColor,
    borderWidth: 1,
    borderColor: black
  });

  const headers = [
    "List of all legal entities or facilities\nover which reporting company has\nequity share, financial control or\noperational control",
    "% equity share\nin legal entity",
    "Does reporting\ncompany have\nfinancial control?\n(yes/no)",
    "Does reporting\ncompany have\noperational control?\n(yes/no)"
  ];

  let currentX = x;
  headers.forEach((header, idx) => {
    const lines = header.split("\n");
    const startY = currentY - 12; // Starting position for first line
    
    lines.forEach((line, lineIdx) => {
      page.drawText(line, {
        x: currentX + 3,
        y: startY - (lineIdx * 9), // 9px spacing between lines
        size: 7,
        font: fontBold,
        maxWidth: colWidths[idx] - 6 // Prevent text overflow
      });
    });

    if (idx < headers.length - 1) {
      page.drawLine({
        start: { x: currentX + colWidths[idx], y: currentY },
        end: {
          x: currentX + colWidths[idx],
          y: currentY - headerHeight - (dataRowHeight * (boundaries.length > 0 ? boundaries.length : 4))
        },
        thickness: 0.5,
        color: black
      });
    }

    currentX += colWidths[idx];
  });

  currentY -= headerHeight;

  // Data rows
  const rowsToShow =
    boundaries.length > 0 ? boundaries : [{}, {}, {}, {}];
  rowsToShow.forEach((boundary) => {
    page.drawRectangle({
      x,
      y: currentY - dataRowHeight,
      width,
      height: dataRowHeight,
      borderWidth: 1,
      borderColor: black
    });

    currentX = x;
    [
      boundary.entity || "",
      boundary.equityShare || "",
      boundary.financialControl || "",
      boundary.operationalControl || ""
    ].forEach((value, idx) => {
      page.drawText(String(value), {
        x: currentX + 3,
        y: currentY - 18,
        size: 8,
        font,
        maxWidth: colWidths[idx] - 6 // Prevent text overflow
      });
      currentX += colWidths[idx];
    });

    currentY -= dataRowHeight;
  });
}

    function drawDetailedEmissionsTable(
      page,
      x,
      y,
      width,
      rows,
      font,
      fontBold,
      blueColor
    ) {
      const rowHeight = 20;
      const colSplit = width * 0.75;
      let currentY = y;

      rows.forEach((row) => {
        const bgColor = row.isHeader
          ? blueColor
          : row.subHeader
          ? lightBlue
          : white;
        const textFont = row.isHeader || row.subHeader ? fontBold : font;
        const textSize = row.isHeader ? 10 : 9;

        page.drawRectangle({
          x,
          y: currentY - rowHeight,
          width,
          height: rowHeight,
          color: bgColor,
          borderWidth: 1,
          borderColor: black
        });

        if (!row.isHeader && !row.subHeader) {
          page.drawLine({
            start: { x: x + colSplit, y: currentY },
            end: { x: x + colSplit, y: currentY - rowHeight },
            thickness: 0.5,
            color: black
          });
        }

        page.drawText(row.label, {
          x: x + 5,
          y: currentY - 14,
          size: textSize,
          font: textFont
        });

        if (row.value && !row.isHeader && !row.subHeader) {
          page.drawText(String(row.value), {
            x: x + colSplit + 5,
            y: currentY - 14,
            size: 8,
            font
          });
        }

        currentY -= rowHeight;
      });
    }

    // New helper: labeled multiline box
    function drawLabeledTextArea(
      page,
      x,
      y,
      width,
      boxHeight,
      label,
      value,
      font,
      fontBold
    ) {
      // Label
      page.drawText(label, {
        x,
        y,
        size: 9,
        font: fontBold,
        maxWidth: width
      });

      const rectTop = y - 18;

      // Box
      page.drawRectangle({
        x,
        y: rectTop - boxHeight,
        width,
        height: boxHeight,
        borderWidth: 1,
        borderColor: black
      });

      if (value) {
        page.drawText(String(value), {
          x: x + 5,
          y: rectTop - 14,
          size: 9,
          font,
          maxWidth: width - 10
        });
      }

      // return new y slightly below box
      return rectTop - boxHeight - 20;
    }

    // New helper: facility table
    function drawFacilityTable(
      page,
      x,
      y,
      width,
      facilities,
      font,
      fontBold,
      blueColor
    ) {
      const rowHeight = 22;
      const headerHeight = rowHeight;
      const colWidths = [width * 0.6, width * 0.4];
      let currentY = y;

      // Header background
      page.drawRectangle({
        x,
        y: currentY - headerHeight,
        width,
        height: headerHeight,
        color: blueColor,
        borderWidth: 1,
        borderColor: black
      });

      // Header text
      page.drawText("Facility", {
        x: x + 5,
        y: currentY - 15,
        size: 9,
        font: fontBold
      });
      page.drawText("Scope 1 emissions", {
        x: x + colWidths[0] + 5,
        y: currentY - 15,
        size: 9,
        font: fontBold
      });

      // Vertical divider
      page.drawLine({
        start: { x: x + colWidths[0], y: currentY },
        end: {
          x: x + colWidths[0],
          y: currentY - headerHeight - rowHeight * 5
        },
        thickness: 0.5,
        color: black
      });

      currentY -= headerHeight;

      const rowsToShow =
        facilities.length > 0 ? facilities : [{}, {}, {}, {}, {}];

      rowsToShow.forEach((f) => {
        page.drawRectangle({
          x,
          y: currentY - rowHeight,
          width,
          height: rowHeight,
          borderWidth: 1,
          borderColor: black
        });

        const facilityName = f.facility || "";
        const scope1 = f.scope1Emissions || "";

        page.drawText(String(facilityName), {
          x: x + 5,
          y: currentY - 14,
          size: 8,
          font
        });
        page.drawText(String(scope1), {
          x: x + colWidths[0] + 5,
          y: currentY - 14,
          size: 8,
          font
        });

        currentY -= rowHeight;
      });
    }

    // New helper: country table
    function drawCountryTable(
      page,
      x,
      y,
      width,
      countries,
      font,
      fontBold,
      blueColor
    ) {
      const rowHeight = 22;
      const headerHeight = rowHeight;
      const colWidths = [width * 0.6, width * 0.4];
      let currentY = y;

      // Header background
      page.drawRectangle({
        x,
        y: currentY - headerHeight,
        width,
        height: headerHeight,
        color: blueColor,
        borderWidth: 1,
        borderColor: black
      });

      // Header text
      page.drawText("Country", {
        x: x + 5,
        y: currentY - 15,
        size: 9,
        font: fontBold
      });
      page.drawText("Emissions (specify Scopes included)", {
        x: x + colWidths[0] + 5,
        y: currentY - 15,
        size: 8,
        font: fontBold
      });

      // Vertical divider
      page.drawLine({
        start: { x: x + colWidths[0], y: currentY },
        end: {
          x: x + colWidths[0],
          y: currentY - headerHeight - rowHeight * 5
        },
        thickness: 0.5,
        color: black
      });

      currentY -= headerHeight;

      const rowsToShow =
        countries.length > 0 ? countries : [{}, {}, {}, {}, {}];

      rowsToShow.forEach((c) => {
        page.drawRectangle({
          x,
          y: currentY - rowHeight,
          width,
          height: rowHeight,
          borderWidth: 1,
          borderColor: black
        });

        const countryName = c.country || "";
        const emissions = c.emissions || "";

        page.drawText(String(countryName), {
          x: x + 5,
          y: currentY - 14,
          size: 8,
          font
        });
        page.drawText(String(emissions), {
          x: x + colWidths[0] + 5,
          y: currentY - 14,
          size: 8,
          font
        });

        currentY -= rowHeight;
      });
    }

    // New helper: offsets table (3 columns)
    // function drawOffsetsTable(
    //   page,
    //   x,
    //   y,
    //   width,
    //   rows,
    //   font,
    //   fontBold,
    //   blueColor
    // ) {
    //   const rowHeight = 22;
    //   const headerHeight = rowHeight;
    //   const colWidths = [
    //     width * 0.22,
    //     width * 0.48,
    //     width * 0.3
    //   ];
    //   let currentY = y;

    //   // Header background
    //   page.drawRectangle({
    //     x,
    //     y: currentY - headerHeight,
    //     width,
    //     height: headerHeight,
    //     color: blueColor,
    //     borderWidth: 1,
    //     borderColor: black
    //   });

    //   const headerTitles = [
    //     "Quantity of GHGs (mtCO2e)",
    //     "Type of offset project",
    //     "Were the offsets verified/certified and/or approved by an external GHG program (e.g., CDM)"
    //   ];

    //   let currentX = x;
    //   headerTitles.forEach((title, idx) => {
    //     page.drawText(title, {
    //       x: currentX + 3,
    //       y: currentY - 14,
    //       size: 7,
    //       font: fontBold,
    //       maxWidth: colWidths[idx] - 6
    //     });

    //     if (idx < headerTitles.length - 1) {
    //       page.drawLine({
    //         start: { x: currentX + colWidths[idx], y: currentY },
    //         end: {
    //           x: currentX + colWidths[idx],
    //           y: currentY - headerHeight - rowHeight * 5
    //         },
    //         thickness: 0.5,
    //         color: black
    //       });
    //     }

    //     currentX += colWidths[idx];
    //   });

    //   currentY -= headerHeight;

    //   const rowsToShow = rows.length > 0 ? rows : [{}, {}, {}, {}, {}];

    //   rowsToShow.forEach((row) => {
    //     currentX = x;

    //     page.drawRectangle({
    //       x,
    //       y: currentY - rowHeight,
    //       width,
    //       height: rowHeight,
    //       borderWidth: 1,
    //       borderColor: black
    //     });

    //     const quantity = row.quantity || "";
    //     const projectType = row.projectType || "";
    //     const verified = row.verified || "";

    //     const cells = [quantity, projectType, verified];

    //     cells.forEach((cell, idx) => {
    //       page.drawText(String(cell), {
    //         x: currentX + 3,
    //         y: currentY - 14,
    //         size: 8,
    //         font,
    //         maxWidth: colWidths[idx] - 6
    //       });
    //       currentX += colWidths[idx];
    //     });

    //     currentY -= rowHeight;
    //   });
    // }



    // New helper: offsets table with header (3 columns, 2 data rows)
 // New helper: offsets table with header (3 columns, 2 data rows)
function drawOffsetsTableWithHeader(
  page,
  x,
  y,
  width,
  headerText,
  rows,
  font,
  fontBold,
  blueColor
) {
  const rowHeight = 22;
  let currentY = y;

  // Calculate header height based on text wrapping
  const maxHeaderWidth = width - 10;
  const words = headerText.split(' ');
  let lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = fontBold.widthOfTextAtSize(testLine, 9);
    
    if (testWidth > maxHeaderWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);

  const headerHeight = Math.max(25, lines.length * 12 + 10);

  // Draw main header with blue background
  page.drawRectangle({
    x,
    y: currentY - headerHeight,
    width,
    height: headerHeight,
    color: blueColor,
    borderWidth: 1,
    borderColor: black
  });

  // Draw wrapped header text
  lines.forEach((line, idx) => {
    page.drawText(line, {
      x: x + 5,
      y: currentY - 15 - (idx * 12),
      size: 9,
      font: fontBold
    });
  });

  currentY -= headerHeight;

  // Column headers with proper wrapping
  const colWidths = [width * 0.22, width * 0.48, width * 0.3];
  
  const columnTitles = [
    "Quantity of GHGs (mtCO2e)",
    "Type of offset project",
    "Were the offsets verified/certified and/or approved by an external GHG program (e.g., CDM)"
  ];

  // Calculate required height for column headers
  let maxLines = 1;
  columnTitles.forEach((title, idx) => {
    const colMaxWidth = colWidths[idx] - 6;
    const titleWords = title.split(' ');
    let titleLines = [];
    let titleLine = '';

    titleWords.forEach(word => {
      const testLine = titleLine ? `${titleLine} ${word}` : word;
      const testWidth = fontBold.widthOfTextAtSize(testLine, 7);
      
      if (testWidth > colMaxWidth && titleLine) {
        titleLines.push(titleLine);
        titleLine = word;
      } else {
        titleLine = testLine;
      }
    });
    if (titleLine) titleLines.push(titleLine);
    
    maxLines = Math.max(maxLines, titleLines.length);
  });

  const columnHeaderHeight = Math.max(rowHeight, maxLines * 10 + 10);

  page.drawRectangle({
    x,
    y: currentY - columnHeaderHeight,
    width,
    height: columnHeaderHeight,
    color: lightBlue,
    borderWidth: 1,
    borderColor: black
  });

  let currentX = x;
  columnTitles.forEach((title, idx) => {
    // Wrap text for this column
    const colMaxWidth = colWidths[idx] - 6;
    const titleWords = title.split(' ');
    let titleLines = [];
    let titleLine = '';

    titleWords.forEach(word => {
      const testLine = titleLine ? `${titleLine} ${word}` : word;
      const testWidth = fontBold.widthOfTextAtSize(testLine, 7);
      
      if (testWidth > colMaxWidth && titleLine) {
        titleLines.push(titleLine);
        titleLine = word;
      } else {
        titleLine = testLine;
      }
    });
    if (titleLine) titleLines.push(titleLine);

    // Draw wrapped column header text
    titleLines.forEach((line, lineIdx) => {
      page.drawText(line, {
        x: currentX + 3,
        y: currentY - 12 - (lineIdx * 10),
        size: 7,
        font: fontBold,
        maxWidth: colMaxWidth
      });
    });

    if (idx < columnTitles.length - 1) {
      page.drawLine({
        start: { x: currentX + colWidths[idx], y: currentY },
        end: {
          x: currentX + colWidths[idx],
          y: currentY - columnHeaderHeight - rowHeight * 2
        },
        thickness: 0.5,
        color: black
      });
    }

    currentX += colWidths[idx];
  });

  currentY -= columnHeaderHeight;

  // Only 2 data rows
  const rowsToShow = rows.length > 0 ? rows.slice(0, 2) : [{}, {}];
  while (rowsToShow.length < 2) {
    rowsToShow.push({});
  }

  rowsToShow.forEach((row) => {
    currentX = x;

    page.drawRectangle({
      x,
      y: currentY - rowHeight,
      width,
      height: rowHeight,
      borderWidth: 1,
      borderColor: black
    });

    const quantity = row.quantity || "";
    const projectType = row.projectType || "";
    const verified = row.verified || "";

    const cells = [quantity, projectType, verified];

    cells.forEach((cell, idx) => {
      page.drawText(String(cell), {
        x: currentX + 3,
        y: currentY - 14,
        size: 8,
        font,
        maxWidth: colWidths[idx] - 6
      });
      currentX += colWidths[idx];
    });

    currentY -= rowHeight;
  });
}


// New helper: Single row table with blue header
function drawSingleRowTable(
  page,
  x,
  y,
  width,
  headerText,
  value,
  font,
  fontBold,
  blueColor
) {
  let currentY = y;

  // Calculate header height based on text wrapping
  const maxHeaderWidth = width - 10;
  const words = headerText.split(' ');
  let lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = fontBold.widthOfTextAtSize(testLine, 9);
    
    if (testWidth > maxHeaderWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);

  const headerHeight = Math.max(30, lines.length * 12 + 10);

  // Draw header with blue background
  page.drawRectangle({
    x,
    y: currentY - headerHeight,
    width,
    height: headerHeight,
    color: blueColor,
    borderWidth: 1,
    borderColor: black
  });

  // Draw wrapped header text
  lines.forEach((line, idx) => {
    page.drawText(line, {
      x: x + 5,
      y: currentY - 15 - (idx * 12),
      size: 9,
      font: fontBold
    });
  });

  currentY -= headerHeight;

  // Draw single data row
  const dataRowHeight = 50;
  page.drawRectangle({
    x,
    y: currentY - dataRowHeight,
    width,
    height: dataRowHeight,
    borderWidth: 1,
    borderColor: black
  });

  // Draw value text (if provided)
  if (value) {
    page.drawText(String(value), {
      x: x + 5,
      y: currentY - 15,
      size: 9,
      font,
      maxWidth: width - 10
    });
  }
}





// Helper: Facility table with header (2 columns, 2 data rows)
function drawFacilityTableWithHeader(
  page,
  x,
  y,
  width,
  headerText,
  facilities,
  font,
  fontBold,
  blueColor
) {
  const rowHeight = 22;
  let currentY = y;

  // Calculate header height based on text wrapping
  const maxHeaderWidth = width - 10;
  const words = headerText.split(' ');
  let lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = fontBold.widthOfTextAtSize(testLine, 9);
    
    if (testWidth > maxHeaderWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);

  const headerHeight = Math.max(25, lines.length * 12 + 10);

  // Draw main header with blue background
  page.drawRectangle({
    x,
    y: currentY - headerHeight,
    width,
    height: headerHeight,
    color: blueColor,
    borderWidth: 1,
    borderColor: black
  });

  // Draw wrapped header text
  lines.forEach((line, idx) => {
    page.drawText(line, {
      x: x + 5,
      y: currentY - 15 - (idx * 12),
      size: 9,
      font: fontBold
    });
  });

  currentY -= headerHeight;

  // Column headers
  const colWidths = [width * 0.6, width * 0.4];
  
  page.drawRectangle({
    x,
    y: currentY - rowHeight,
    width,
    height: rowHeight,
    color: lightBlue,
    borderWidth: 1,
    borderColor: black
  });

  page.drawText("Facility", {
    x: x + 5,
    y: currentY - 15,
    size: 9,
    font: fontBold
  });
  page.drawText("Scope 1 emissions", {
    x: x + colWidths[0] + 5,
    y: currentY - 15,
    size: 9,
    font: fontBold
  });

  // Vertical divider
  page.drawLine({
    start: { x: x + colWidths[0], y: currentY },
    end: {
      x: x + colWidths[0],
      y: currentY - rowHeight * 3
    },
    thickness: 0.5,
    color: black
  });

  currentY -= rowHeight;

  // Only 2 data rows
  const rowsToShow = facilities.length > 0 ? facilities.slice(0, 2) : [{}, {}];
  while (rowsToShow.length < 2) {
    rowsToShow.push({});
  }

  rowsToShow.forEach((f) => {
    page.drawRectangle({
      x,
      y: currentY - rowHeight,
      width,
      height: rowHeight,
      borderWidth: 1,
      borderColor: black
    });

    const facilityName = f.facility || "";
    const scope1 = f.scope1Emissions || "";

    page.drawText(String(facilityName), {
      x: x + 5,
      y: currentY - 14,
      size: 8,
      font
    });
    page.drawText(String(scope1), {
      x: x + colWidths[0] + 5,
      y: currentY - 14,
      size: 8,
      font
    });

    currentY -= rowHeight;
  });
}

// Helper: Country table with header (2 columns, 2 data rows)
function drawCountryTableWithHeader(
  page,
  x,
  y,
  width,
  headerText,
  countries,
  font,
  fontBold,
  blueColor
) {
  const rowHeight = 22;
  let currentY = y;

  // Calculate header height based on text wrapping
  const maxHeaderWidth = width - 10;
  const words = headerText.split(' ');
  let lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = fontBold.widthOfTextAtSize(testLine, 9);
    
    if (testWidth > maxHeaderWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);

  const headerHeight = Math.max(25, lines.length * 12 + 10);

  // Draw main header with blue background
  page.drawRectangle({
    x,
    y: currentY - headerHeight,
    width,
    height: headerHeight,
    color: blueColor,
    borderWidth: 1,
    borderColor: black
  });

  // Draw wrapped header text
  lines.forEach((line, idx) => {
    page.drawText(line, {
      x: x + 5,
      y: currentY - 15 - (idx * 12),
      size: 9,
      font: fontBold
    });
  });

  currentY -= headerHeight;

  // Column headers
  const colWidths = [width * 0.6, width * 0.4];
  
  page.drawRectangle({
    x,
    y: currentY - rowHeight,
    width,
    height: rowHeight,
    color: lightBlue,
    borderWidth: 1,
    borderColor: black
  });

  page.drawText("Country", {
    x: x + 5,
    y: currentY - 15,
    size: 9,
    font: fontBold
  });
  page.drawText("Emissions (specify Scopes included)", {
    x: x + colWidths[0] + 5,
    y: currentY - 15,
    size: 8,
    font: fontBold
  });

  // Vertical divider
  page.drawLine({
    start: { x: x + colWidths[0], y: currentY },
    end: {
      x: x + colWidths[0],
      y: currentY - rowHeight * 3
    },
    thickness: 0.5,
    color: black
  });

  currentY -= rowHeight;

  // Only 2 data rows
  const rowsToShow = countries.length > 0 ? countries.slice(0, 2) : [{}, {}];
  while (rowsToShow.length < 2) {
    rowsToShow.push({});
  }

  rowsToShow.forEach((c) => {
    page.drawRectangle({
      x,
      y: currentY - rowHeight,
      width,
      height: rowHeight,
      borderWidth: 1,
      borderColor: black
    });

    const countryName = c.country || "";
    const emissions = c.emissions || "";

    page.drawText(String(countryName), {
      x: x + 5,
      y: currentY - 14,
      size: 8,
      font
    });
    page.drawText(String(emissions), {
      x: x + colWidths[0] + 5,
      y: currentY - 14,
      size: 8,
      font
    });

    currentY -= rowHeight;
  });
}

    // ============================================
    // FINALIZE PDF
    // ============================================
    const pdfBytes = await pdfDoc.save();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `GHG-Protocol-Report-${timestamp}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.setHeader("Content-Length", pdfBytes.length);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "PDF generation failed", detail: err.message });
  }
});




// ____________________________________________________________________________________________________________









utility.app.get('/', (req, res) => {
  res.send("Hello I am working");
})

utility.app.listen(utility.port, () => {
  console.log(`Example app listening on port ${utility.port}`)
})





