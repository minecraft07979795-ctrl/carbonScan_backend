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

const dotenv = require("dotenv");
dotenv.config();  // Only this, no custom path

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

// const dotenv = require('dotenv');



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
  origin: [process.env.FRONTEND_URL, "http://localhost:3000","https://frontend-project-ab.vercel.app"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));




// ============= ROUTES (ALL BEFORE app.listen!) =============

// Root & Health routes
utility.app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Reput Carbon API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

utility.app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});





// if (process.env.NODE_ENV === 'production') {
//   dotenv.config({ path: '.env.production' });
// } else {
//   dotenv.config({ path: '.env.local' });
// }



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

utility.app.post('/get_project_category_monthly_carbon',
  templates.get_project_category_monthly_carbon
);

utility.app.post('/get_project_category_scope_totals',
  templates.get_project_category_scope_totals
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




 
 

 

 






// _________________________________________________________________________


const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fetch = require("node-fetch");

utility.app.post("/generate_pdf", async (req, res) => {
  try {
    const data = req.body || {};

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Light blue color for table headers
    const lightBlue = rgb(0.678, 0.847, 0.902);
    const black = rgb(0, 0, 0);
    const white = rgb(1, 1, 1);

    // ============================================
    // PAGE 1: TITLE PAGE
    // ============================================
    const page1 = pdfDoc.addPage([595, 842]);
    let y = 760;

    // Title - Centered (always show)
    const title = "Greenhouse Gas Emissions Inventory";
    const titleWidth = fontBold.widthOfTextAtSize(title, 18);
    page1.drawText(title, {
      x: (595 - titleWidth) / 2,
      y,
      size: 18,
      font: fontBold,
      color: black
    });
    y -= 40;

    // Company Name - Centered (only if provided)
    if (data.companyName) {
      const companyWidth = fontBold.widthOfTextAtSize(data.companyName, 14);
      page1.drawText(data.companyName, {
        x: (595 - companyWidth) / 2,
        y,
        size: 14,
        font: fontBold,
        color: black
      });
      y -= 30;
    }

    // Inventory Year - Centered (only if provided)
    if (data.inventoryYear) {
      const yearWidth = fontBold.widthOfTextAtSize(data.inventoryYear, 14);
      page1.drawText(data.inventoryYear, {
        x: (595 - yearWidth) / 2,
        y,
        size: 14,
        font: fontBold,
        color: black
      });
      y -= 50;
    } else {
      y -= 30;
    }

    // Company Logo (only if provided)
    if (data.companyLogoUrl) {
      try {
        console.log("Fetching logo from:", data.companyLogoUrl);
        const response = await fetch(data.companyLogoUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const imageBytes = new Uint8Array(arrayBuffer);
        
        let logoImage;
        const url = data.companyLogoUrl.toLowerCase();
        
        if (url.endsWith('.png') || url.includes('.png?') || url.includes('format=png')) {
          logoImage = await pdfDoc.embedPng(imageBytes);
        } else if (url.endsWith('.jpg') || url.endsWith('.jpeg') || 
                   url.includes('.jpg?') || url.includes('.jpeg?') ||
                   url.includes('format=jpg') || url.includes('format=jpeg')) {
          logoImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          try {
            logoImage = await pdfDoc.embedPng(imageBytes);
          } catch {
            logoImage = await pdfDoc.embedJpg(imageBytes);
          }
        }

        const boxWidth = 495;
        const boxHeight = 80;
        const imgDims = logoImage.scale(1);
        
        const scaleX = (boxWidth - 20) / imgDims.width;
        const scaleY = (boxHeight - 20) / imgDims.height;
        const scale = Math.min(scaleX, scaleY, 1);
        
        const scaledWidth = imgDims.width * scale;
        const scaledHeight = imgDims.height * scale;
        
        const imgX = 50 + (boxWidth - scaledWidth) / 2;
        const imgY = y - 80 + (boxHeight - scaledHeight) / 2;

        page1.drawImage(logoImage, {
          x: imgX,
          y: imgY,
          width: scaledWidth,
          height: scaledHeight
        });
        
        y -= 100;
        console.log("Logo embedded successfully");
      } catch (error) {
        console.error("Error embedding logo:", error.message);
        y -= 20;
      }
    }

    // Verification Section (only if verification status is provided)
    if (data.verified !== undefined) {
      y -= 20;

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

      const verHeader = "Has this inventory been verified by an accredited third party?";
      const hdrWidth = fontBold.widthOfTextAtSize(verHeader, 10);
      page1.drawText(verHeader, {
        x: 50 + (495 - hdrWidth) / 2,
        y: y - 22,
        size: 10,
        font: fontBold
      });
      y -= 30;

      // Yes / No Options Row
      const optionHeight = 25;
      page1.drawRectangle({
        x: 50,
        y: y - optionHeight,
        width: 495,
        height: optionHeight,
        borderWidth: 1,
        borderColor: black
      });

      page1.drawText("[ ] No", { x: 70, y: y - 17, size: 10, font });
      page1.drawText(
        "[ ] Yes (if yes, fill verification information below)",
        { x: 200, y: y - 17, size: 10, font }
      );

      y -= optionHeight + 15;

      // If YES → Show Verification Details Table
      if (data.verified) {
        const verificationRows = [];
        if (data.verificationDate) verificationRows.push({ label: "Date of verification:", value: data.verificationDate });
        if (data.verifier) verificationRows.push({ label: "Verifier:", value: data.verifier });
        if (data.verifierEmail) verificationRows.push({ label: "Email:", value: data.verifierEmail });
        if (data.verifierPhone) verificationRows.push({ label: "Phone:", value: data.verifierPhone });
        if (data.verifierAddress) verificationRows.push({ label: "Address:", value: data.verifierAddress });
        
        if (verificationRows.length > 0) {
          drawSimpleTable(page1, 50, y, 495, verificationRows, font, fontBold);
          y -= verificationRows.length * 25 + 20;
        }
      } else {
        y -= 20;
      }
    }

    // Exclusions (only if provided)
    if (data.exclusions) {
      y -= 20;
      drawSingleRowTable(
        page1,
        50,
        y,
        495,
        "Have any facilities, operations and/or emissions sources been excluded from this inventory? If yes, please specify.",
        data.exclusions,
        font,
        fontBold,
        lightBlue
      );
      y -= 80;
    }

    // Reporting Period (only if dates provided)
    if (data.periodFrom || data.periodTo) {
      y -= 20;
      const periodText = `From ${data.periodFrom || "MM/DD/YYYY"} to ${data.periodTo || "MM/DD/YYYY"}`;
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
    }

    // ============================================
    // PAGE 2: ORGANIZATIONAL & OPERATIONAL BOUNDARIES
    // ============================================
    const page2 = pdfDoc.addPage([595, 842]);
    y = 760;

    // Organizational Boundaries Section (only if any consolidation approach is selected)
    if (data.equityShare || data.financialControl || data.operationalControl) {
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

      const headerHeight = consolidationText.length * 12 + 10;

      page2.drawRectangle({
        x: 50,
        y: y - headerHeight,
        width: 495,
        height: headerHeight,
        color: lightBlue,
        borderWidth: 1,
        borderColor: black
      });

      consolidationText.forEach((line, idx) => {
        page2.drawText(line, { 
          x: 55, 
          y: y - 15 - (idx * 12), 
          size: 9, 
          font: fontBold 
        });
      });

      y -= headerHeight;

      const checkboxRowHeight = 30;
      page2.drawRectangle({
        x: 50,
        y: y - checkboxRowHeight,
        width: 495,
        height: checkboxRowHeight,
        borderWidth: 1,
        borderColor: black
      });

      const option1 = data.equityShare ? "[ ] Equity Share" : "[ ] Equity Share";
      const option2 = data.financialControl ? "[ ] Financial Control" : "[ ] Financial Control";
      const option3 = data.operationalControl ? "[ ] Operational Control" : "[ ] Operational Control";

      page2.drawText(option1, { x: 70, y: y - 20, size: 10, font });
      page2.drawText(option2, { x: 220, y: y - 20, size: 10, font });
      page2.drawText(option3, { x: 390, y: y - 20, size: 10, font });

      y -= checkboxRowHeight + 20;
    }

    // Operational Boundaries Section
    page2.drawText("OPERATIONAL BOUNDARIES", {
      x: 50,
      y,
      size: 14,
      font: fontBold
    });

    y -= 35;

    // Scope 3 included question (only if specified)
    if (data.scope3Included !== undefined) {
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
            label: data.scope3Included ? "[ ] yes  [ ] no" : "[ ] yes  [ ] no",
            value: "",
            isData: true
          }
        ],
        font,
        fontBold,
        lightBlue
      );
      y -= 80;
    }

    // Scope 3 Activities (only if provided)
    if (data.scope3Activities) {
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

      const valueRowHeight = 50;
      page2.drawRectangle({
        x: 50,
        y: y - valueRowHeight,
        width: 495,
        height: valueRowHeight,
        borderWidth: 1,
        borderColor: black
      });

      page2.drawText(String(data.scope3Activities), {
        x: 55,
        y: y - 15,
        size: 9,
        font,
        maxWidth: 485
      });

      y -= valueRowHeight + 10;
    }

    // Main Emissions Table (only if any emissions data provided)
    const hasEmissionsData = data.emissions && Object.keys(data.emissions).length > 0;
    
    if (hasEmissionsData) {
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
    }

    // Biogenic Emissions (only if provided)
    if (data.biogenicEmissions) {
      drawTableWithBlueHeader(
        page2,
        50,
        y,
        495,
        [
          {
            label: "Direct CO2 emissions from Biogenic combustion (mtCO2)",
            value: data.biogenicEmissions,
            isHeader: true
          }
        ],
        font,
        fontBold,
        lightBlue
      );
    }

    // ============================================
    // PAGE 3: BASE YEAR & METHODOLOGIES
    // ============================================
    const page3 = pdfDoc.addPage([595, 842]);
    y = 760;

    // Base Year Section (only if any base year data provided)
    const hasBaseYearData = data.baseYear || data.baseYearPolicy || data.baseYearContext || 
                            (data.baseYearEmissions && Object.keys(data.baseYearEmissions).length > 0);

    if (hasBaseYearData) {
      page3.drawText("BASE YEAR", {
        x: 50,
        y,
        size: 14,
        font: fontBold
      });
      y -= 35;

      if (data.baseYear) {
        drawSingleRowTable(
          page3,
          50,
          y,
          495,
          "Year chosen as base year",
          data.baseYear,
          font,
          fontBold,
          lightBlue
        );
        y -= 80;
      }

      if (data.baseYearPolicy) {
        drawSingleRowTable(
          page3,
          50,
          y,
          495,
          "Clarification of company-determined policy for making base year emissions recalculations",
          data.baseYearPolicy,
          font,
          fontBold,
          lightBlue
        );
        y -= 80;
      }

      if (data.baseYearContext) {
        drawSingleRowTable(
          page3,
          50,
          y,
          495,
          "Context for any significant emissions changes that trigger base year emissions recalculations",
          data.baseYearContext,
          font,
          fontBold,
          lightBlue
        );
        y -= 80;
      }

      if (data.baseYearEmissions && Object.keys(data.baseYearEmissions).length > 0) {
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
          data.baseYearEmissions,
          font,
          fontBold,
          lightBlue
        );
        y -= 140;
      }
    }

    // Methodologies Section (only if provided)
    if (data.methodologies) {
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
        data.methodologies,
        font,
        fontBold,
        lightBlue
      );
    }

    // ============================================
    // PAGE 4: DETAILED EMISSIONS & ORG TABLE
    // ============================================
    const page4 = pdfDoc.addPage([595, 842]);
    y = 760;

    // Organizational Boundaries Table (only if data provided)
    if (data.organizationalBoundaries && data.organizationalBoundaries.length > 0) {
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
        data.organizationalBoundaries,
        font,
        fontBold,
        lightBlue
      );
      y -= 150;
    }

    // Organizational Diagram (only if provided)
    if (data.organizationalDiagram) {
      drawSingleRowTable(
        page4,
        50,
        y,
        495,
        "If the reporting company's parent company does not report emissions, include an organizational diagram that clearly defines relationship of the reporting subsidiary as well as other subsidiaries",
        data.organizationalDiagram,
        font,
        fontBold,
        lightBlue
      );
      y -= 120;
    }

    // Detailed Emissions by Source Type (only show if any data exists)
    const hasDetailedEmissions = data.stationaryCombustion || data.mobileCombustion || 
      data.processSources || data.fugitiveSources || data.agriculturalSources ||
      data.electricity || data.steam || data.heating || data.cooling ||
      data.purchased_goods_services || data.capital_goods || data.fuel_energy_related ||
      data.upstream_transport_distribution || data.waste_generated || data.business_travel ||
      data.employee_commuting || data.upstream_leased_assets || 
      data.downstream_transport_distribution || data.processing_sold_products ||
      data.use_sold_products || data.end_of_life_sold_products ||
      data.downstream_leased_assets || data.franchises || data.investments;

    if (hasDetailedEmissions) {
      page4.drawText("INFORMATION ON EMISSIONS", {
        x: 50,
        y,
        size: 14,
        font: fontBold
      });
      y -= 35;

      const detailedEmissions = [
        { label: "Emissions disaggregated by source types", value: "", isHeader: true }
      ];

      // Add Scope 1 section if any Scope 1 data exists
      const hasScope1 = data.stationaryCombustion || data.mobileCombustion || 
                        data.processSources || data.fugitiveSources || data.agriculturalSources;
      
      if (hasScope1) {
        detailedEmissions.push({
          label: "Scope 1: Direct Emissions from Owned/Controlled Operations",
          value: "",
          subHeader: true
        });
        if (data.stationaryCombustion) detailedEmissions.push({
          label: "a. Direct Emissions from Stationary Combustion",
          value: data.stationaryCombustion
        });
        if (data.mobileCombustion) detailedEmissions.push({
          label: "b. Direct Emissions from Mobile Combustion",
          value: data.mobileCombustion
        });
        if (data.processSources) detailedEmissions.push({
          label: "c. Direct Emissions from Process Sources",
          value: data.processSources
        });
        if (data.fugitiveSources) detailedEmissions.push({
          label: "d. Direct Emissions from Fugitive Sources",
          value: data.fugitiveSources
        });
        if (data.agriculturalSources) detailedEmissions.push({
          label: "e. Direct Emissions from Agricultural Sources",
          value: data.agriculturalSources
        });
      }

      // Add Scope 2 section if any Scope 2 data exists
      const hasScope2 = data.electricity || data.steam || data.heating || data.cooling;
      
      if (hasScope2) {
        detailedEmissions.push({
          label: "Scope 2: Indirect Emissions from the Use of Purchased Electricity, Steam, Heating and Cooling",
          value: "",
          subHeader: true
        });
        if (data.electricity) detailedEmissions.push({
          label: "a. Indirect Emissions from Purchased/Acquired Electricity",
          value: data.electricity
        });
        if (data.steam) detailedEmissions.push({
          label: "b. Indirect Emissions from Purchased/Acquired Steam",
          value: data.steam
        });
        if (data.heating) detailedEmissions.push({
          label: "c. Indirect Emissions from Purchased/Acquired Heating",
          value: data.heating
        });
        if (data.cooling) detailedEmissions.push({
          label: "d. Indirect Emissions from Purchased/Acquired Cooling",
          value: data.cooling
        });
      }

      // Add Scope 3 section if any Scope 3 data exists
      const hasScope3 = data.purchased_goods_services || data.capital_goods || 
        data.fuel_energy_related || data.upstream_transport_distribution || 
        data.waste_generated || data.business_travel || data.employee_commuting ||
        data.upstream_leased_assets || data.downstream_transport_distribution ||
        data.processing_sold_products || data.use_sold_products ||
        data.end_of_life_sold_products || data.downstream_leased_assets ||
        data.franchises || data.investments;

      if (hasScope3) {
        detailedEmissions.push({
          label: "Scope 3: Other Indirect Emissions (15 Categories)",
          value: "",
          subHeader: true
        });
        
        if (data.purchased_goods_services) detailedEmissions.push({
          label: "1. Purchased Goods and Services",
          value: data.purchased_goods_services
        });
        if (data.capital_goods) detailedEmissions.push({
          label: "2. Capital Goods",
          value: data.capital_goods
        });
        if (data.fuel_energy_related) detailedEmissions.push({
          label: "3. Fuel- and Energy-Related Activities (not included in Scope 1 or 2)",
          value: data.fuel_energy_related
        });
        if (data.upstream_transport_distribution) detailedEmissions.push({
          label: "4. Upstream Transportation and Distribution",
          value: data.upstream_transport_distribution
        });
        if (data.waste_generated) detailedEmissions.push({
          label: "5. Waste Generated in Operations",
          value: data.waste_generated
        });
        if (data.business_travel) detailedEmissions.push({
          label: "6. Business Travel",
          value: data.business_travel
        });
        if (data.employee_commuting) detailedEmissions.push({
          label: "7. Employee Commuting",
          value: data.employee_commuting
        });
        if (data.upstream_leased_assets) detailedEmissions.push({
          label: "8. Upstream Leased Assets",
          value: data.upstream_leased_assets
        });
      }

      // Check if we need to split across pages (more than 25 rows)
      if (detailedEmissions.length <= 25) {
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
      } else {
        // Draw first part
        drawDetailedEmissionsTable(
          page4,
          50,
          y,
          495,
          detailedEmissions.slice(0, 25),
          font,
          fontBold,
          lightBlue
        );

        // Continue remaining Scope 3 on new page
        const page4a = pdfDoc.addPage([595, 842]);
        y = 760;

        page4a.drawText("INFORMATION ON EMISSIONS (Continued)", {
          x: 50,
          y,
          size: 14,
          font: fontBold
        });
        y -= 35;

        const remainingEmissions = [
          {
            label: "Scope 3: Other Indirect Emissions (Continued)",
            value: "",
            subHeader: true
          }
        ];

        if (data.downstream_transport_distribution) remainingEmissions.push({
          label: "9. Downstream Transportation and Distribution",
          value: data.downstream_transport_distribution
        });
        if (data.processing_sold_products) remainingEmissions.push({
          label: "10. Processing of Sold Products",
          value: data.processing_sold_products
        });
        if (data.use_sold_products) remainingEmissions.push({
          label: "11. Use of Sold Products",
          value: data.use_sold_products
        });
        if (data.end_of_life_sold_products) remainingEmissions.push({
          label: "12. End-of-Life Treatment of Sold Products",
          value: data.end_of_life_sold_products
        });
        if (data.downstream_leased_assets) remainingEmissions.push({
          label: "13. Downstream Leased Assets",
          value: data.downstream_leased_assets
        });
        if (data.franchises) remainingEmissions.push({
          label: "14. Franchises",
          value: data.franchises
        });
        if (data.investments) remainingEmissions.push({
          label: "15. Investments",
          value: data.investments
        });

        drawDetailedEmissionsTable(
          page4a,
          50,
          y,
          495,
          remainingEmissions,
          font,
          fontBold,
          lightBlue
        );
      }
    }

    // ============================================
    // PAGE 5: FURTHER EMISSIONS INFORMATION
    // ============================================
    const hasPage5Data = (data.facilityEmissions && data.facilityEmissions.length > 0) ||
                         (data.countryEmissions && data.countryEmissions.length > 0) ||
                         data.ownGenerationEmissions || data.purchasedForResaleEmissions ||
                         data.nonKyotoEmissions;

    if (hasPage5Data) {
      const page5 = pdfDoc.addPage([595, 842]);
      y = 760;

      page5.drawText("INFORMATION ON EMISSIONS", {
        x: 50,
        y,
        size: 14,
        font: fontBold
      });
      y -= 40;

      if (data.facilityEmissions && data.facilityEmissions.length > 0) {
        drawFacilityTableWithHeader(
          page5,
          50,
          y,
          495,
          "Emissions disaggregated by facility (recommended for individual facilities with stationary combustion emissions over 10,000 mtCO2e)",
          data.facilityEmissions,
          font,
          fontBold,
          lightBlue
        );
        y -= 120;
      }

      if (data.countryEmissions && data.countryEmissions.length > 0) {
        drawCountryTableWithHeader(
          page5,
          50,
          y,
          495,
          "Emissions disaggregated by country",
          data.countryEmissions,
          font,
          fontBold,
          lightBlue
        );
        y -= 120;
      }

      if (data.ownGenerationEmissions) {
        drawSingleRowTable(
          page5,
          50,
          y,
          495,
          "Emissions attributable to own generation of electricity, heat, or steam that is sold or transferred to another organization",
          data.ownGenerationEmissions,
          font,
          fontBold,
          lightBlue
        );
        y -= 80;
      }

      if (data.purchasedForResaleEmissions) {
        drawSingleRowTable(
          page5,
          50,
          y,
          495,
          "Emissions attributable to the generation of electricity, heat or steam that is purchased for re-sale to non-end users",
          data.purchasedForResaleEmissions,
          font,
          fontBold,
          lightBlue
        );
        y -= 80;
      }

      if (data.nonKyotoEmissions) {
        drawSingleRowTable(
          page5,
          50,
          y,
          495,
          "Emissions from GHGs not covered by the Kyoto Protocol (e.g., CFCs, NOx)",
          data.nonKyotoEmissions,
          font,
          fontBold,
          lightBlue
        );
      }
    }

    // ============================================
    // PAGE 6: EMISSIONS CONTEXT & TRENDS
    // ============================================
    const hasPage6Data = data.emissionChangeCauses || data.historicalEmissions ||
                         data.performanceIndicators || data.managementPrograms;

    if (hasPage6Data) {
      const page6 = pdfDoc.addPage([595, 842]);
      y = 760;

      page6.drawText("INFORMATION ON EMISSIONS", {
        x: 50,
        y,
        size: 14,
        font: fontBold
      });
      y -= 40;

      if (data.emissionChangeCauses) {
        drawSingleRowTable(
          page6,
          50,
          y,
          495,
          "Information on the causes of emissions changes that did not trigger a base year emissions recalculation (e.g., process changes, efficiency improvements, plant closures)",
          data.emissionChangeCauses,
          font,
          fontBold,
          lightBlue
          );
          y -= 80;
        }
        if (data.historicalEmissions) {
    drawSingleRowTable(
      page6,
      50,
      y,
      495,
      "GHG emissions data for all years between the base year and the reporting year (including details of and reasons for recalculations, if appropriate)",
      data.historicalEmissions,
      font,
      fontBold,
      lightBlue
    );
    y -= 80;
  }

  if (data.performanceIndicators) {
    drawSingleRowTable(
      page6,
      50,
      y,
      495,
      "Relevant ratio performance indicators (e.g. emissions per kilowatt-hour generated, sales, etc.)",
      data.performanceIndicators,
      font,
      fontBold,
      lightBlue
    );
    y -= 80;
  }

  if (data.managementPrograms) {
    drawSingleRowTable(
      page6,
      50,
      y,
      495,
      "An outline of any GHG management/reduction programs or strategies",
      data.managementPrograms,
      font,
      fontBold,
      lightBlue
    );
  }
}

// ============================================
// PAGE 7: ADDITIONAL INFORMATION
// ============================================
const hasPage7Data = data.contractualProvisions || data.externalAssurance ||
                     data.inventoryQuality || data.sequestrationInfo;

if (hasPage7Data) {
  const page7 = pdfDoc.addPage([595, 842]);
  y = 760;

  page7.drawText("ADDITIONAL INFORMATION", {
    x: 50,
    y,
    size: 14,
    font: fontBold
  });
  y -= 40;

  if (data.contractualProvisions) {
    drawSingleRowTable(
      page7,
      50,
      y,
      495,
      "Information on any contractual provisions addressing GHG-related risks and obligations",
      data.contractualProvisions,
      font,
      fontBold,
      lightBlue
    );
    y -= 80;
  }

  if (data.externalAssurance) {
    drawSingleRowTable(
      page7,
      50,
      y,
      495,
      "An outline of any external assurance provided and a copy of any verification statement, if applicable, of the reported emissions data",
      data.externalAssurance,
      font,
      fontBold,
      lightBlue
    );
    y -= 80;
  }

  if (data.inventoryQuality) {
    drawSingleRowTable(
      page7,
      50,
      y,
      495,
      "Information on the quality of the inventory (e.g., information on the causes and magnitude of uncertainties in emission estimates) and an outline of policies in place to improve inventory quality",
      data.inventoryQuality,
      font,
      fontBold,
      lightBlue
    );
    y -= 80;
  }

  if (data.sequestrationInfo) {
    drawSingleRowTable(
      page7,
      50,
      y,
      495,
      "Information on any GHG sequestration",
      data.sequestrationInfo,
      font,
      fontBold,
      lightBlue
    );
  }
}

// ============================================
// PAGE 8: INFORMATION ON OFFSETS
// ============================================
const hasPage8Data = (data.offsetsOutsideBoundary && data.offsetsOutsideBoundary.length > 0) ||
                     (data.offsetsInsideBoundary && data.offsetsInsideBoundary.length > 0);

if (hasPage8Data) {
  const page8 = pdfDoc.addPage([595, 842]);
  y = 760;

  page8.drawText("INFORMATION ON OFFSETS", {
    x: 50,
    y,
    size: 14,
    font: fontBold
  });
  y -= 40;

  if (data.offsetsOutsideBoundary && data.offsetsOutsideBoundary.length > 0) {
    drawOffsetsTableWithHeader(
      page8,
      50,
      y,
      495,
      "Information on offsets that have been purchased or developed outside the inventory boundary",
      data.offsetsOutsideBoundary,
      font,
      fontBold,
      lightBlue
    );
    y -= 120;
  }

  if (data.offsetsInsideBoundary && data.offsetsInsideBoundary.length > 0) {
    drawOffsetsTableWithHeader(
      page8,
      50,
      y,
      495,
      "Information on reductions inside the inventory boundary that have been sold/transferred as offsets to a third party",
      data.offsetsInsideBoundary,
      font,
      fontBold,
      lightBlue
    );
  }
}

// ============================================
// HELPER FUNCTIONS (Keep all your existing helper functions)
// ============================================
function drawTableWithBlueHeader(page, x, y, width, rows, font, fontBold, blueColor) {
  const rowHeight = rows.isHeader && rows.value !== "" ? 80 : 30;
  let currentY = y;

  rows.forEach((row) => {
    page.drawRectangle({
      x,
      y: currentY - rowHeight,
      width,
      height: rowHeight,
      borderWidth: 1,
      borderColor: black,
      color: row.isHeader ? blueColor : white
    });

    const textFont = row.isHeader ? fontBold : font;
    const textSize = row.isHeader ? 10 : 9;

    if (row.value) {
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

      page.drawLine({
        start: { x: x + colSplit, y: currentY },
        end: { x: x + colSplit, y: currentY - rowHeight },
        thickness: 1,
        color: black
      });
    } else {
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

  page.drawRectangle({
    x,
    y: currentY - rowHeight * rows.length,
    width,
    height: rowHeight * rows.length,
    borderWidth: 1,
    borderColor: black
  });

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

function drawEmissionsTable(page, x, y, width, emissions, font, fontBold, blueColor) {
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

function drawOrganizationalTable(page, x, y, width, boundaries, font, fontBold, blueColor) {
  const colWidths = [width * 0.4, width * 0.2, width * 0.2, width * 0.2];
  const headerHeight = 50;
  const dataRowHeight = 30;
  let currentY = y;

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
    const startY = currentY - 12;
    
    lines.forEach((line, lineIdx) => {
      page.drawText(line, {
        x: currentX + 3,
        y: startY - (lineIdx * 9),
        size: 7,
        font: fontBold,
        maxWidth: colWidths[idx] - 6
      });
    });

    if (idx < headers.length - 1) {
      page.drawLine({
        start: { x: currentX + colWidths[idx], y: currentY },
        end: {
          x: currentX + colWidths[idx],
          y: currentY - headerHeight - (dataRowHeight * boundaries.length)
        },
        thickness: 0.5,
        color: black
      });
    }

    currentX += colWidths[idx];
  });

  currentY -= headerHeight;

  boundaries.forEach((boundary) => {
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
        maxWidth: colWidths[idx] - 6
      });
      currentX += colWidths[idx];
    });

    currentY -= dataRowHeight;
  });
}

function drawDetailedEmissionsTable(page, x, y, width, rows, font, fontBold, blueColor) {
  const rowHeight = 20;
  const colSplit = width * 0.75;
  let currentY = y;

  rows.forEach((row) => {
    const bgColor = row.isHeader ? blueColor : row.subHeader ? lightBlue : white;
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

function drawSingleRowTable(page, x, y, width, headerText, value, font, fontBold, blueColor) {
  let currentY = y;

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

  page.drawRectangle({
    x,
    y: currentY - headerHeight,
    width,
    height: headerHeight,
    color: blueColor,
    borderWidth: 1,
    borderColor: black
  });

  lines.forEach((line, idx) => {
    page.drawText(line, {
      x: x + 5,
      y: currentY - 15 - (idx * 12),
      size: 9,
      font: fontBold
    });
  });

  currentY -= headerHeight;

  const dataRowHeight = 50;
  page.drawRectangle({
    x,
    y: currentY - dataRowHeight,
    width,
    height: dataRowHeight,
    borderWidth: 1,
    borderColor: black
  });

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

function drawFacilityTableWithHeader(page, x, y, width, headerText, facilities, font, fontBold, blueColor) {
  const rowHeight = 22;
  let currentY = y;

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

  page.drawRectangle({
    x,
    y: currentY - headerHeight,
    width,
    height: headerHeight,
    color: blueColor,
    borderWidth: 1,
    borderColor: black
  });

  lines.forEach((line, idx) => {
    page.drawText(line, {
      x: x + 5,
      y: currentY - 15 - (idx * 12),
      size: 9,
      font: fontBold
    });
  });

  currentY -= headerHeight;

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

  page.drawLine({
    start: { x: x + colWidths[0], y: currentY },
    end: { x: x + colWidths[0], y: currentY - rowHeight * (facilities.length + 1) },
    thickness: 0.5,
    color: black
  });

  currentY -= rowHeight;

  facilities.forEach((f) => {
    page.drawRectangle({
      x,
      y: currentY - rowHeight,
      width,
      height: rowHeight,
      borderWidth: 1,
      borderColor: black
    });

    page.drawText(String(f.facility || ""), {
      x: x + 5,
      y: currentY - 14,
      size: 8,
      font
    });
    page.drawText(String(f.scope1Emissions || ""), {
      x: x + colWidths[0] + 5,
      y: currentY - 14,
      size: 8,
      font
    });

    currentY -= rowHeight;
  });
}

function drawCountryTableWithHeader(page, x, y, width, headerText, countries, font, fontBold, blueColor) {
  const rowHeight = 22;
  let currentY = y;

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

  page.drawRectangle({
    x,
    y: currentY - headerHeight,
    width,
    height: headerHeight,
    color: blueColor,
    borderWidth: 1,
    borderColor: black
  });

  lines.forEach((line, idx) => {
    page.drawText(line, {
      x: x + 5,
      y: currentY - 15 - (idx * 12),
      size: 9,
      font: fontBold
    });
  });

  currentY -= headerHeight;

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

  page.drawLine({
    start: { x: x + colWidths[0], y: currentY },
    end: { x: x + colWidths[0], y: currentY - rowHeight * (countries.length + 1) },
    thickness: 0.5,
    color: black
  });

  currentY -= rowHeight;

  countries.forEach((c) => {
    page.drawRectangle({
      x,
      y: currentY - rowHeight,
      width,
      height: rowHeight,
      borderWidth: 1,
      borderColor: black
    });

    page.drawText(String(c.country || ""), {
      x: x + 5,
      y: currentY - 14,
      size: 8,
      font
    });
    page.drawText(String(c.emissions || ""), {
      x: x + colWidths[0] + 5,
      y: currentY - 14,
      size: 8,
      font
    });

    currentY -= rowHeight;
  });
}

function drawOffsetsTableWithHeader(page, x, y, width, headerText, rows, font, fontBold, blueColor) {
  const rowHeight = 22;
  let currentY = y;

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

  page.drawRectangle({
    x,
    y: currentY - headerHeight,
    width,
    height: headerHeight,
    color: blueColor,
    borderWidth: 1,
    borderColor: black
  });

  lines.forEach((line, idx) => {
    page.drawText(line, {
      x: x + 5,
      y: currentY - 15 - (idx * 12),
      size: 9,
      font: fontBold
    });
  });

  currentY -= headerHeight;

  const colWidths = [width * 0.22, width * 0.48, width * 0.3];
  
  const columnTitles = [
    "Quantity of GHGs (mtCO2e)",
    "Type of offset project",
    "Were the offsets verified/certified and/or approved by an external GHG program (e.g., CDM)"
  ];

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
          y: currentY - columnHeaderHeight - rowHeight * rows.length
        },
        thickness: 0.5,
        color: black
      });
    }

    currentX += colWidths[idx];
  });

  currentY -= columnHeaderHeight;

  rows.forEach((row) => {
    currentX = x;

    page.drawRectangle({
      x,
      y: currentY - rowHeight,
      width,
      height: rowHeight,
      borderWidth: 1,
      borderColor: black
    });

    const cells = [row.quantity || "", row.projectType || "", row.verified || ""];

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

// ============================================
// FINALIZE PDF
// ============================================
const pdfBytes = await pdfDoc.save();
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const filename = `GHG-Protocol-Report-${timestamp}.pdf`;

res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
res.setHeader("Content-Length", pdfBytes.length);
res.send(Buffer.from(pdfBytes));
} catch (err) {
console.log(err);
res.status(500).json({ error: "PDF generation failed", detail: err.message });
}
});


// _________________________________________________________________________

 



 
// ____________________________________________________________________________________________________________









// utility.app.get('/', (req, res) => {
//   res.send("Hello I am working");
// })

// utility.app.listen(utility.port, () => {
// utility.app.listen(utility.port, "0.0.0.0", () => {
//   console.log(`Example app listening on port ${utility.port}`)
// })



// // Add health check endpoint
// utility.app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'ok', 
//     message: 'Server is running',
//     timestamp: new Date().toISOString()
//   });
// })










const server = utility.app.listen(utility.port, "0.0.0.0", () => {
  console.log(`🚀 Server started successfully`);
  console.log(`📡 Listening on: http://0.0.0.0:${utility.port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

server.on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});