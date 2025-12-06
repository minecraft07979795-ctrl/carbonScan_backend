const cloudinary = require("../config/cloudinary.js");


const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fetch = require("node-fetch");

class Templates {
  constructor(_utility) {
    this.utility = _utility;
  }

  CreateCustomTemplate = async (req, res) => {
    try {
      const { template_name, description, template_payload } = req.body;
      const creator_user_id = req.user.userId; // From JWT token

      // Call the PostgreSQL function
      const query = {
        text: 'SELECT * FROM create_custom_template_from_scratch($1, $2, $3, $4)',
        values: [creator_user_id, template_name, description, JSON.stringify(template_payload)]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows || result.rows.length === 0) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      const { new_template_id, status_message } = result.rows[0];

      if (new_template_id) {
        return this.utility.response.init(res, true, status_message, {
          template_id: new_template_id,
          template_name,
          description
        }, 201);
      } else {
        // Handle database errors (duplicate name, etc.)
        return this.utility.response.init(res, false, status_message, {
          error: "TEMPLATE_CREATION_FAILED"
        }, 400);
      }

    } catch (error) {
      console.error('Error creating custom template:', error);
      return this.utility.response.init(res, false, "Internal server error while creating template", {
        error: "INTERNAL_SERVER_ERROR",
        details: error.message
      }, 500);
    }
  };


  create_custom_temp_template_from_scratch = async (req, res) => {
    try {
      const { template_name, description, template_payload } = req.body;
      const creator_user_id = req.user.userId; // From JWT token

      // Call the PostgreSQL function
      const query = {
        text: 'SELECT * FROM create_custom_temp_template_from_scratch($1, $2, $3, $4)',
        values: [creator_user_id, template_name, description, JSON.stringify(template_payload)]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows || result.rows.length === 0) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      const { new_template_id, status_message } = result.rows[0];

      if (new_template_id) {
        return this.utility.response.init(res, true, status_message, {
          template_id: new_template_id,
          template_name,
          description
        }, 201);
      } else {
        // Handle database errors (duplicate name, etc.)
        return this.utility.response.init(res, false, status_message, {
          error: "TEMPLATE_CREATION_FAILED"
        }, 400);
      }

    } catch (error) {
      console.error('Error creating custom template:', error);
      return this.utility.response.init(res, false, "Internal server error while creating template", {
        error: "INTERNAL_SERVER_ERROR",
        details: error.message
      }, 500);
    }
  };












  GetTemplateDetailsById = async (req, res) => {
    try {
      const { template_id } = req.query;

      const query = {
        text: 'SELECT get_template_details_by_id($1) as template_data',
        values: [template_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows || result.rows.length === 0) {
        return this.utility.response.init(res, false, "Template not found", {
          error: "TEMPLATE_NOT_FOUND"
        }, 404);
      }

      const templateData = result.rows[0].template_data;

      if (!templateData) {
        return this.utility.response.init(res, false, "Template data is empty", {
          error: "EMPTY_TEMPLATE"
        }, 404);
      }

      return this.utility.response.init(
        res,
        true,
        "Template details retrieved successfully",
        {
          template: templateData
        }
      );

    } catch (error) {
      console.error('Error fetching template details:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching template details",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };




  GetTemplatesForUser = async (req, res) => {
    try {

      // const { search_term } = req.query;
      // const user_id = req.user.userId; // From JWT token

      const { org_id, industry } = req.body

      const query = {
        text: 'SELECT * FROM get_templates_for_user($1, $2)',
        // values: [user_id, search_term || null]
        values: [org_id, industry || null]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  UpdateExistingCustomTemplate = async (req, res) => {
    try {
      const { template_id, new_name, new_description, new_payload } = req.body;
      const user_id = req.user.userId; // from JWT

      const query = {
        text: 'SELECT public.update_existing_custom_template($1, $2, $3, $4, $5::jsonb) AS message',
        values: [user_id, template_id, new_name, new_description, JSON.stringify(new_payload)]
      };

      const result = await this.utility.sql.query(query);
      const message = result.rows?.[0]?.message || 'No response from database';
      const success = message.toLowerCase().includes('successfully');

      return this.utility.response.init(res, success, message, { message });
    } catch (error) {
      console.error('Error updating template:', error);
      return this.utility.response.init(res, false, 'Failed to update template', { error: error.message }, 500);
    }
  };





  apply_template_to_project = async (req, res) => {
    try {

      const { p_project_id, p_template_id } = req.body

      const query = {
        text: 'SELECT * FROM apply_template_to_project($1, $2)',
        values: [p_project_id, p_template_id || null]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };





  get_template_details_by_id = async (req, res) => {
    try {

      const { p_template_id } = req.body

      const query = {
        text: 'SELECT * FROM get_template_details_by_id($1)',
        values: [p_template_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  //does not exist
  get_main_categories_for_scope_and_source = async (req, res) => {
    try {

      const { p_template_id } = req.body

      const query = {
        text: 'SELECT * FROM  get_main_categories_for_scope_and_source($1)',
        values: [p_template_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  get_subcategories_for_main_category = async (req, res) => {
    try {
      const { p_main_category_id } = req.body;

      const query = {
        text: 'SELECT * FROM get_subcategories_for_main_category($1)',
        values: [p_main_category_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );
    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  get_activities_for_subcategory = async (req, res) => {
    try {

      const { p_main_category, p_subcategory_name } = req.body

      const query = {
        text: 'SELECT * FROM  get_activities_for_subcategory($1,$2)',
        values: [p_main_category, p_subcategory_name]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  get_selection1_for_activity = async (req, res) => {
    try {

      const { p_main_category, p_subcategory_name, p_activity_name } = req.body

      const query = {
        text: 'SELECT * FROM  get_selection1_for_activity($1,$2,$3)',
        values: [p_main_category, p_subcategory_name, p_activity_name]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  get_selection2_for_selection1 = async (req, res) => {
    try {

      const { p_main_category_id, p_subcategory_name, p_activity_name, p_selection_1_name } = req.body

      const query = {
        text: 'SELECT * FROM  get_selection2_for_selection1($1,$2,$3,$4)',
        values: [p_main_category_id, p_subcategory_name, p_activity_name, p_selection_1_name]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  get_emission_factor_for_selection = async (req, res) => {
    try {

      const { p_source, p_scope, p_main_category_id, p_subcategory_name, p_activity_name, p_selection_1_name, p_selection_2_name } = req.body

      const query = {
        text: 'SELECT * FROM  get_emission_factor_for_selection($1,$2,$3,$4,$5,$6,$7)',
        values: [p_source, p_scope, p_main_category_id, p_subcategory_name, p_activity_name, p_selection_1_name, p_selection_2_name]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };



  get_template_usage_percentage = async (req, res) => {
    try {

      const { p_template_id, p_parent_org_id, p_industry } = req.body

      const query = {
        text: 'SELECT * FROM  get_template_usage_percentage($1,$2,$3)',
        values: [p_template_id, p_parent_org_id, p_industry]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  save_project_activity_configuration = async (req, res) => {
    try {

      const { p_project_id, p_configured_activities } = req.body

      const query = {
        text: 'SELECT * FROM  save_project_activity_configuration($1,$2)',
        values: [p_project_id, p_configured_activities]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "save_project_activity_configuration  successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  // _______________________________________________________________________________

  copy_template_to_staging_area = async (req, res) => {
    try {
      const { p_project_id, p_template_id } = req.body
      const query = {
        text: 'SELECT * FROM  copy_template_to_staging_area($1,$2)',
        values: [p_project_id, p_template_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "template data copied to stage area successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  get_staged_activities_for_project = async (req, res) => {
    try {

      const { p_project_id, p_scope } = req.body

      const query = {
        text: 'SELECT * FROM  get_staged_activities_for_project($1,$2)',
        values: [p_project_id, p_scope]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }
          // Check if no records returned
    if (result.rows.length === 0) {
      return this.utility.response.init(
        res,
        false,
        "No staged template data available",
        {
          templates: [],
          count: 0
        },
        200
      );
    }

      return this.utility.response.init(
        res,
        true,
        "Getting Staged Template Data successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };



  // append_staged_activity_by_id = async (req, res) => {
  //   try {
      
  //     const { p_project_id, p_subcategory_id, p_frequency } = req.body;


  //     const query = {
  //       text: 'SELECT * FROM append_staged_activity_by_id($1,$2,$3)',
  //       values: [p_project_id, p_subcategory_id, p_frequency]
  //     };

  //     const result = await this.utility.sql.query(query);

  //     if (!result.rows || result.rows.length === 0) {
  //       return this.utility.response.init(res, false, "append_staged_activity_by_id not found", {
  //         error: "append_staged_activity_by_id_NOT_FOUND"
  //       }, 404);
  //     }

  //     console.log("first->>",result);

  //     const templateData = result.rows[0].template_data;

  //     if (!templateData) {
  //       return this.utility.response.init(res, false, "Template data is empty", {
  //         error: "EMPTY_TEMPLATE"
  //       }, 404);
  //     }

  //     return this.utility.response.init(
  //       res,
  //       true,
  //       "Data Added on Staged Template Area successfully",
  //       {
  //         template: templateData
  //       }
  //     );

  //   } catch (error) {
  //     console.error('Error fetching template details:', error);
  //     return this.utility.response.init(
  //       res,
  //       false,
  //       "Internal server error while fetching template details",
  //       {
  //         error: "INTERNAL_SERVER_ERROR",
  //         details: error.message
  //       },
  //       500
  //     );
  //   }
  // };



  append_staged_activity_by_id = async (req, res) => {
  try {
    const { p_project_id, p_subcategory_id, p_frequency } = req.body;

    const query = {
      text: 'SELECT * FROM append_staged_activity_by_id($1,$2,$3)',
      values: [p_project_id, p_subcategory_id, p_frequency]
    };

    const result = await this.utility.sql.query(query);

    if (!result.rows || result.rows.length === 0) {
      return this.utility.response.init(
        res,
        false,
        "No response from database",
        { error: "DB_EMPTY" },
        500
      );
    }

    const dbResponse = result.rows[0].append_staged_activity_by_id;
    const msg = dbResponse?.toString() || "Unknown DB response";

    // Identify if DB returned "Error:"
    if (msg.toLowerCase().startsWith("error")) {
      return this.utility.response.init(
        res,
        false,
        msg,
        { rawMessage: msg },
        400
      );
    }

    // Otherwise treat as success
    return this.utility.response.init(
      res,
      true,
      msg,
      {}
    );

  } catch (error) {
    console.error('Error fetching template details:', error);
    return this.utility.response.init(
      res,
      false,
      "Internal server error while processing request",
      {
        error: "INTERNAL_SERVER_ERROR",
        details: error.message
      },
      500
    );
  }
};

 


  commit_staged_changes_to_project = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'SELECT * FROM commit_staged_changes_to_project($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "commited staged changes to project successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  // _______________________________________________________________________________


  run_all_validations_for_project = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'SELECT * FROM   run_all_validations_for_project($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "run_all_validations_for_project successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };



  get_project_review_data = async (req, res) => {
    try {

      const { p_project_id, p_scope_name } = req.body

      const query = {
        text: 'SELECT * FROM   get_project_review_data($1,$2)',
        values: [p_project_id, p_scope_name]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_review_data successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };



  submit_project_for_approval = async (req, res) => {
    try {

      const { p_project_id, p_project_user_ids } = req.body

      const query = {
        text: 'SELECT * FROM   submit_project_for_approval($1,$2)',
        values: [p_project_id, p_project_user_ids]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "submit_project_for_approval successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  get_approval_status_for_project = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'SELECT * FROM   get_approval_status_for_project($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_approval_status_for_project successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  upload_document_for_activity = async (req, res) => {
    try {

      const { p_project_id, p_user_id, p_activity_id, p_file_name, p_file_url, p_file_size } = req.body

      const query = {
        text: 'SELECT * FROM   upload_document_for_activity($1,$2,$3,$4,$5,$6)',
        values: [p_project_id, p_user_id, p_activity_id, p_file_name, p_file_url, p_file_size]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "upload_document_for_activity successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  get_project_members_for_approval = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'SELECT * FROM   get_project_members_for_approval($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_members_for_approval  successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  get_project_overall_completion = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'SELECT * FROM   get_project_overall_completion($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_overall_completion successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  search_auditors_to_add_to_project = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'Select * from search_auditors_to_add_to_project($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "template copy successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  synchronize_project_approver = async (req, res) => {
    try {

      const { p_project_id, p_role_name, p_new_approver_ids } = req.body

      const query = {
        text: 'Select * from synchronize_project_approver($1,$2,$3)',
        values: [p_project_id, p_role_name, p_new_approver_ids]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "template copy successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  get_project_monthly_summary = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'Select * from get_project_monthly_summary($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "template copy successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };



  create_new_project_request_with_file = async (req, res) => {
    try {

      const { p_creator_id, p_project_id, p_assignee_id, p_request_type, p_title, p_description, p_file_name, p_file_url, p_file_size } = req.body;

      let fileURL = null;

      console.log("req.files?.p_file_url ->", req.files?.p_file_url)
      let fileName = req.files?.p_file_url[0].originalname;

      if (req.files?.p_file_url?.length > 0) {
        const uploadRes = await cloudinary.uploader.upload(req.files.p_file_url[0].path, { resource_type: "raw" });
        fileURL = uploadRes.secure_url;
      }

      const query = {
        text: 'Select * from create_new_project_request_with_file($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        values: [p_creator_id, p_project_id, p_assignee_id, p_request_type, p_title, p_description, fileName, fileURL, 15]
      };

      console.log(query.values);

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "create_new_project_request_with_file successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };




  get_project_total_emissions_summary = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'Select * from get_project_total_emissions_summary($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_total_emissions_summary successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };




  get_available_users_for_project_team = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'SELECT * FROM   get_available_users_for_project_team($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_available_users_for_project_team successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };




  get_data_collection_sheet_for_scope = async (req, res) => {
    try {

      const { p_project_id, p_scope_name, p_page_size, p_page_number } = req.body

      const query = {
        text: 'SELECT * FROM   get_data_collection_sheet_for_scope($1,$2,$3,$4)',
        values: [p_project_id, p_scope_name, p_page_size, p_page_number]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_data_collection_sheet_for_scope successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };



  // upsert_activity_data_batch = async (req, res) => {
  //   try {

  //     const { p_project_id, p_user_id, p_data_batch } = req.body

  //     const query = {
  //       text: 'SELECT * FROM   upsert_activity_data_batch($1,$2,$3)',
  //       values: [p_project_id, p_user_id, p_data_batch]
  //     };

  //     const result = await this.utility.sql.query(query);

  //     if (!result.rows) {
  //       return this.utility.response.init(res, false, "No response from database", {
  //         error: "DATABASE_ERROR"
  //       }, 500);
  //     }

  //     return this.utility.response.init(
  //       res,
  //       true,
  //       " commit_staged_changes_to_project successfully",
  //       {
  //         templates: result.rows,
  //         count: result.rows.length
  //       }
  //     );

  //   } catch (error) {
  //     console.error('Error fetching templates:', error);
  //     return this.utility.response.init(
  //       res,
  //       false,
  //       "Internal server error while fetching templates",
  //       {
  //         error: "INTERNAL_SERVER_ERROR",
  //         details: error.message
  //       },
  //       500
  //     );
  //   }
  // };





  upsert_activity_data_batch = async (req, res) => {
  try {
    let { p_project_id, p_user_id, p_data_batch } = req.body;
  
      if (!Array.isArray(p_data_batch) || p_data_batch.length === 0) {
        return this.utility.response.init(res, false, "Data batch cannot be empty", {
          error: "INVALID_INPUT"
        }, 400);
      }
      

    const query = {
      text: "SELECT * FROM upsert_activity_data_batch($1, $2, $3::jsonb)",
      values: [p_project_id, p_user_id, JSON.stringify(p_data_batch)]   // <-- JSON object, not string
    };

    const result = await this.utility.sql.query(query);

    if (!result?.rows) {
      return this.utility.response.init(
        res,
        false,
        "No response from database",
        { error: "DATABASE_ERROR" },
        500
      );
    }

    return this.utility.response.init(
      res,
      true,
      "Batch data inserted successfully",
      {
        data: result.rows,
        count: result.rows.length
      }
    );

  } catch (error) {
    console.error("Error in upsert_activity_data_batch:", error);
    return this.utility.response.init(
      res,
      false,
      "Internal server error",
      {
        error: "INTERNAL_SERVER_ERROR",
        details: error.message
      },
      500
    );
  }
};







  create_custom_template_from_scratch = async (req, res) => {
    try {

      const { p_creator_user_id, p_template_name, p_description, p_industry, p_template_payload } = req.body

      const query = {
        text: 'SELECT * FROM  create_custom_template_from_scratch($1,$2,$3,$4,$5)',
        values: [p_creator_user_id, p_template_name, p_description, p_industry, p_template_payload]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "save_project_activity_configuration  successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  }





  update_project_member_permission = async (req, res) => {
    try {

      const { p_project_id, p_member_user_id, p_new_permission_level } = req.body

      const query = {
        text: 'SELECT * FROM  update_project_member_permission($1,$2,$3)',
        values: [p_project_id, p_member_user_id, p_new_permission_level]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "update project member permission  successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  }






  add_new_member_to_project = async (req, res) => {
    try {

      const { p_project_id, p_user_id, p_role_name, p_permission_level } = req.body

      const query = {
        text: 'Select * from add_new_member_to_project($1,$2,$3,$4)',
        values: [p_project_id, p_user_id, p_role_name, p_permission_level]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "successfully added new member to project",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  }




  update_project_member_permission = async (req, res) => {
    try {

      const { p_project_id, p_member_user_id, p_new_permission_level } = req.body

      const query = {
        text: 'Select * from update_project_member_permission($1,$2,$3)',
        values: [p_project_id, p_member_user_id, p_new_permission_level]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "successfully updated project member permission",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  }




  remove_member_from_project = async (req, res) => {
    try {

      const { p_project_id, p_user_id } = req.body

      const query = {
        text: 'Select * from remove_member_from_project($1,$2)',
        values: [p_project_id, p_user_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "successfully removed member from project",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  }






  // get_data_collection_sheet_for_scope = async (req, res) => {
  //   try {

  //     const { p_project_id, p_scope_name, p_page_size, p_page_number } = req.body

  //     const query = {
  //       text: 'SELECT * FROM get_data_collection_sheet_for_scope($1,$2,$3,$4)',
  //       values: [p_project_id, p_scope_name, p_page_size, p_page_number]
  //     };

  //     const result = await this.utility.sql.query(query);

  //     if (!result.rows) {
  //       return this.utility.response.init(res, false, "No response from database", {
  //         error: "DATABASE_ERROR"
  //       }, 500);
  //     }

  //     return this.utility.response.init(
  //       res,
  //       true,
  //       "save_project_activity_configuration  successfully",
  //       {
  //         templates: result.rows,
  //         count: result.rows.length
  //       }
  //     );

  //   } catch (error) {
  //     console.error('Error fetching templates:', error);
  //     return this.utility.response.init(
  //       res,
  //       false,
  //       "Internal server error while fetching templates",
  //       {
  //         error: "INTERNAL_SERVER_ERROR",
  //         details: error.message
  //       },
  //       500
  //     );
  //   }
  // }





  getUnitById = async (req, res) => {
    try {

      const { unit_id } = req.body

      const query = {
        text: 'SELECT * FROM units WHERE unit_id = $1',
        values: [unit_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Unit fetch successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  }






  remove_project_auditor = async (req, res) => {
  try {
    const { p_project_id, p_auditor_id, p_requester_id } = req.body;

    const query = {
      text: 'SELECT * FROM remove_project_auditor($1,$2,$3)',
      values: [p_project_id, p_auditor_id, p_requester_id]
    };

    const result = await this.utility.sql.query(query);

    if (!result.rows || result.rows.length === 0) {
      return this.utility.response.init(res, false, "No response from database", {
        error: "DATABASE_ERROR"
      }, 500);
    }

    const row = result.rows[0];

    // ❌ DB returned error → mark unsuccessful
    if (row.remove_project_auditor && row.remove_project_auditor.includes("Error")) {
      return this.utility.response.init(
        res,
        false,
        row.remove_project_auditor,
        {
          templates: result.rows
        },
        400 // or something appropriate
      );
    }

    // ✅ Success → mark successful
    return this.utility.response.init(
      res,
      true,
      "remove_project_auditor successfully",
      {
        templates: result.rows,
        count: result.rows.length
      }
    );

  } catch (error) {
    console.error('Error fetching templates:', error);
    return this.utility.response.init(
      res,
      false,
      "Internal server error while fetching templates",
      {
        error: "INTERNAL_SERVER_ERROR",
        details: error.message
      },
      500
    );
  }
};





  // remove_project_auditor = async (req, res) => {
  //   try {

  //     const { p_project_id, p_auditor_id, p_requester_id } = req.body

  //     const query = {
  //       text: 'SELECT * FROM remove_project_auditor($1,$2,$3)',
  //       values: [p_project_id, p_auditor_id, p_requester_id]
  //     };

  //     const result = await this.utility.sql.query(query);

  //     if (!result.rows) {
  //       return this.utility.response.init(res, false, "No response from database", {
  //         error: "DATABASE_ERROR"
  //       }, 500);
  //     }

  //     return this.utility.response.init(
  //       res,
  //       true,
  //       "remove_project_auditor successfully",
  //       {
  //         templates: result.rows,
  //         count: result.rows.length
  //       }
  //     );

  //   } catch (error) {
  //     console.error('Error fetching templates:', error);
  //     return this.utility.response.init(
  //       res,
  //       false,
  //       "Internal server error while fetching templates",
  //       {
  //         error: "INTERNAL_SERVER_ERROR",
  //         details: error.message
  //       },
  //       500
  //     );
  //   }
  // };




  recalculate_project_status = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'SELECT * FROM recalculate_project_status($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "recalculate_project_status successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };




  getAllProjectsByOrgID = async (req, res) => {
    try {

      const { org_id } = req.body

      const query = {
        text: 'SELECT * FROM projects WHERE org_id = $1',
        values: [org_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Fetching Projects successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };





  getUserInfoByUserID = async (req, res) => {
    try {

      const { user_id } = req.body

      const query = {
        text: 'SELECT u.full_name,  u.email,  u.phone_number,  o.org_name,  f.facility_name,  u.facility_id FROM users u LEFT JOIN organisation o ON u.org_id = o.org_id LEFT JOIN facilities f ON u.facility_id = f.facility_id WHERE u.user_id = $1',
        values: [user_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Fetching Projects successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };








  getAllProjectsByFacilityID = async (req, res) => {
    try {

      const { project_id } = req.body

      const query = {
        text: 'SELECT * FROM projects WHERE project_id = $1',
        values: [project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Fetching Projects successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };






  get_project_category_totals = async (req, res) => {
    try {

      const { project_id } = req.body

      const query = {
        text: 'SELECT * FROM get_project_category_totals($1)',
        values: [project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Fetching Projects successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };






  get_project_details_by_org = async (req, res) => {
    try {

      const { org_id } = req.body

      const query = {
        text: 'SELECT p.*, f.facility_name, o.org_name FROM projects p LEFT JOIN facilities f ON p.facility_id = f.facility_id LEFT JOIN organisation o ON p.org_id = o.org_id WHERE p.org_id = $1;',
        values: [org_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Fetching Projects successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };






  get_project_portfolio_list = async (req, res) => {
    try {

      const { p_user_id, p_view_type } = req.body

      const query = {
        text: 'SELECT  * FROM get_project_portfolio_list($1,$2);',
        values: [p_user_id, p_view_type]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_portfolio_list successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };





  // get_project_portfolio_stats  = async (req, res) => {
  //   try {

  //     const { p_user_id } = req.body

  //     const query = {
  //       text: 'SELECT  * FROM get_project_portfolio_stats($1);',
  //       values: [p_user_id]
  //     };

  //     const result = await this.utility.sql.query(query);

  //     if (!result.rows) {
  //       return this.utility.response.init(res, false, "No response from database", {
  //         error: "DATABASE_ERROR"
  //       }, 500);
  //     }

  //     return this.utility.response.init(
  //       res,
  //       true,
  //       "get_project_portfolio_list successfully",
  //       {
  //         templates: result.rows,
  //         count: result.rows.length
  //       }
  //     );

  //   } catch (error) {
  //     console.error('Error fetching templates:', error);
  //     return this.utility.response.init(
  //       res,
  //       false,
  //       "Internal server error while fetching templates",
  //       {
  //         error: "INTERNAL_SERVER_ERROR",
  //         details: error.message
  //       },
  //       500
  //     );
  //   }
  // };



  get_task_header = async (req, res) => {
    try {

      const { p_task_id } = req.body

      const query = {
        text: 'SELECT  * FROM get_task_header($1);',
        values: [p_task_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_portfolio_list successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };




  get_assigned_tasks_for_user = async (req, res) => {
    try {

      const { p_user_id, p_status_filter } = req.body

      const query = {
        text: 'SELECT  * FROM get_assigned_tasks_for_user($1,$2);',
        values: [p_user_id, p_status_filter]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_portfolio_list successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };






  get_task_conversation = async (req, res) => {
    try {

      const { p_task_id } = req.body

      const query = {
        text: 'SELECT * FROM get_task_conversation($1);',
        values: [p_task_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_task_conversation successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };








  add_task_comment = async (req, res) => {
    try {

      const { p_task_id, p_user_id, p_comment_text, p_file_name, p_file_url, p_file_size } = req.body

      const query = {
        text: 'SELECT  * FROM add_task_comment ($1,$2,$3,$4,$5,$6);',
        values: [p_task_id, p_user_id, p_comment_text, p_file_name, p_file_url, p_file_size]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "comment added  successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };








  

  // get_user_project_requests = async (req, res) => {
  //   try {

  //     const {  p_user_id , p_status_filter  } = req.body

  //     const query = {
  //       text: 'Select * from get_user_project_requests($1,$2)',
  //       values: [ p_user_id, p_status_filter]
  //     };

  //     const result = await this.utility.sql.query(query);

  //     if (!result.rows) {
  //       return this.utility.response.init(res, false, "No response from database", {
  //         error: "DATABASE_ERROR"
  //       }, 500);
  //     }

  //     return this.utility.response.init(
  //       res,
  //       true,
  //       "get_user_project_requests successfully",
  //       {
  //         templates: result.rows,
  //         count: result.rows.length
  //       }
  //     );

  //   } catch (error) {
  //     console.error('Error fetching templates:', error);
  //     return this.utility.response.init(
  //       res,
  //       false,
  //       "Internal server error while fetching templates",
  //       {
  //         error: "INTERNAL_SERVER_ERROR",
  //         details: error.message
  //       },
  //       500
  //     );
  //   }
  // };



get_user_project_requests = async (req, res) => {
  try {
    const { p_user_id, p_status_filter } = req.body;

    const query = {
      text: 'SELECT * FROM get_user_project_requests($1,$2)',
      values: [p_user_id, p_status_filter]
    };

    const result = await this.utility.sql.query(query);

    if (!result.rows || result.rows.length === 0) {
      return this.utility.response.init(res, true, "No records found", {
        summary: {},
        requests: []
      });
    }

    const summaryFields = [
      'total_related_requests',
      'total_team_requests',
      'total_user_requests',
      'total_open_requests',
      'total_closed_requests'
    ];

    // Extract summary from first row
    const summary = {};
    summaryFields.forEach(key => {
      summary[key] = result.rows[0][key];
    });

    // Generate cleaned request list
    const requests = result.rows.map(row => {
      const cleaned = { ...row };
      summaryFields.forEach(key => delete cleaned[key]);
      return cleaned;
    });

    return this.utility.response.init(res, true, "Fetched successfully", {
      summary,
      requests,
      count: requests.length
    });

  } catch (error) {
    console.error("Error fetching project requests:", error);
    return this.utility.response.init(res, false, "Internal server error", {
      error: "INTERNAL_SERVER_ERROR",
      details: error.message
    }, 500);
  }
};


  

  get_all_facilities_for_parent_org_of_user = async (req, res) => {
    try {

      const {  p_user_id   } = req.body

      const query = {
        text: 'Select * from get_all_facilities_for_parent_org_of_user($1)',
        values: [ p_user_id ]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_all_facilities_for_parent_org_of_user successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };



  

  record_approver_decision = async (req, res) => {
    try {

      const {  p_project_id,p_approver_id_user_id , p_decision, p_remarks  } = req.body

      const query = {
        text: 'Select * from record_approver_decision($1,$2,$3,$4)',
        values: [ p_project_id,p_approver_id_user_id , p_decision, p_remarks ]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "record_approver_decision successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  
  

  delete_staged_activity = async (req, res) => {
    try {

      const {  p_project_id , p_subcategory_id  } = req.body

      const query = {
        text: 'Select * from delete_staged_activity($1,$2)',
        values: [ p_project_id, p_subcategory_id ]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "delete_staged_activity successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  
  
  

  update_staged_activity = async (req, res) => {
    try {

      const {  p_project_id , p_old_subcategory_id, p_new_subcategory_id, p_new_frequency  } = req.body

      const query = {
        text: 'Select * from update_staged_activity($1,$2,$3,$4)',
        values: [ p_project_id , p_old_subcategory_id, p_new_subcategory_id, p_new_frequency ]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "update_staged_activity successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  

  getUnits = async (req, res) => {
    try {

      const query = {
        text: 'SELECT unit_name,unit_id FROM units',
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "record_approver_decision successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };




  

  get_project_category_monthly_carbon = async (req, res) => {
    try {

      const {p_project_id} = req.body; 

      const query = {
        text: 'SELECT * FROM get_project_category_monthly_carbon($1)',
        values:[p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_category_monthly_carbon successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  


  

  get_organization_monthly_carbon_verified_by_user = async (req, res) => {
    try {

      const {p_user_id} = req.body; 

      const query = {
        text: 'SELECT * FROM get_organization_monthly_carbon_verified_by_user($1)',
        values:[p_user_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_organization_monthly_carbon_verified_by_user successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  

  get_project_category_scope_totals = async (req, res) => {
    try {

      const {p_project_id} = req.body; 

      const query = {
        text: 'SELECT * FROM get_project_category_scope_totals($1)',
        values:[p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_category_scope_totals successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };





  //for send data to generate_pdf

  // get_project_category_carbon_with_facilities = async (req, res) => {
  //   try {

  //     const {p_project_id} = req.body; 

  //     const query = {
  //       text: 'SELECT * FROM get_project_category_carbon_with_facilities($1)',
  //       values:[p_project_id]
  //     };

  //     const result = await this.utility.sql.query(query);

  //     if (!result.rows) {
  //       return this.utility.response.init(res, false, "No response from database", {
  //         error: "DATABASE_ERROR"
  //       }, 500);
  //     }

  //     return this.utility.response.init(
  //       res,
  //       true,
  //       "get_project_category_carbon_with_facilities successfully",
  //       {
  //         templates: result.rows,
  //         count: result.rows.length
  //       }
  //     );

  //   } catch (error) {
  //     console.error('Error fetching templates:', error);
  //     return this.utility.response.init(
  //       res,
  //       false,
  //       "Internal server error while fetching templates",
  //       {
  //         error: "INTERNAL_SERVER_ERROR",
  //         details: error.message
  //       },
  //       500
  //     );
  //   }
  // };



// Put near top of modules/template.js if not already:
// const fetch = require('node-fetch');

// get_project_category_carbon_with_facilities = async (req, res) => {
//   try {
//     const { p_project_id } = req.body;

//     const query = {
//       text: "SELECT * FROM get_project_category_carbon_with_facilities($1)",
//       values: [p_project_id],
//     };

//     const result = await this.utility.sql.query(query);

//     if (!result.rows) {
//       return this.utility.response.init(
//         res,
//         false,
//         "No response from database",
//         { error: "DATABASE_ERROR" },
//         500
//       );
//     }

//     const rows = result.rows;

//     // -----------------------
//     // category mapping => generate_pdf keys
//     // -----------------------
//     const categoryMap = {
//       // Scope 1
//       "Direct Emissions from Stationary Combustion": "stationaryCombustion",
//       "Direct Emissions from Mobile Combustion": "mobileCombustion",
//       "Direct Emissions from Process Sources": "processSources",
//       "Direct Emissions from Fugitive Sources": "fugitiveSources",
//       "Direct Emissions from Agricultural Sources": "agriculturalSources",

//       // Scope 2 common names
//       "Indirect Emissions from Purchased/Acquired Electricity": "electricity",
//       "Indirect Emissions from Purchased/Acquired Steam": "steam",
//       "Indirect Emissions from Purchased/Acquired Heating": "heating",
//       "Indirect Emissions from Purchased/Acquired Cooling": "cooling",
//       "Indirect Emission (Electricity)": "electricity",
//       "Electricity": "electricity",

//       // Scope 3 (various names)
//       "Category 1: Purchased goods and services": "purchased_goods_services",
//       "Purchased Goods & Services": "purchased_goods_services",
//       "Capital Goods": "capital_goods",
//       "Fuel & Energy Related Activities": "fuel_energy_related",
//       "Category 4: Upstream transportation and distribution": "upstream_transport_distribution",
//       "Upstream Transportation & Distribution": "upstream_transport_distribution",
//       "Category 5: Waste generated in operations": "waste_generated",
//       "Waste Generated in Operations": "waste_generated",
//       "Business Travel": "business_travel",
//       "Employee Commuting": "employee_commuting",
//       "Upstream Leased Assets": "upstream_leased_assets",
//       "Downstream Transportation & Distribution": "downstream_transport_distribution",
//       "Processing of Sold Products": "processing_sold_products",
//       "Use of Sold Products": "use_sold_products",
//       "End-of-Life Treatment of Sold Products": "end_of_life_sold_products",
//       "Downstream Leased Assets": "downstream_leased_assets",
//       "Franchises": "franchises",
//       "Investments": "investments"
//     };

//     // -----------------------
//     // build pdf payload skeleton with null defaults
//     // -----------------------
//     const buildPdfSkeleton = () => ({
//       companyName: null,
//       inventoryYear: null,
//       companyLogoUrl: null,
//       verified: null,
//       verificationDate: null,
//       verifier: null,
//       verifierEmail: null,
//       verifierPhone: null,
//       verifierAddress: null,
//       exclusions: null,
//       periodFrom: null,
//       periodTo: null,
//       equityShare: null,
//       financialControl: null,
//       operationalControl: null,
//       scope3Included: null,
//       scope3Activities: null,
//       emissions: {
//         scope1Total: null, scope1CO2: null, scope1CH4: null, scope1N2O: null,
//         scope1HFCs: null, scope1PFCs: null, scope1SF6: null,
//         scope2Total: null, scope2CO2: null, scope2CH4: null, scope2N2O: null,
//         scope2HFCs: null, scope2PFCs: null, scope2SF6: null,
//         scope3Total: null, scope3CO2: null, scope3CH4: null, scope3N2O: null,
//         scope3HFCs: null, scope3PFCs: null, scope3SF6: null
//       },
//       biogenicEmissions: null,
//       baseYear: null,
//       baseYearPolicy: null,
//       baseYearContext: null,
//       baseYearEmissions: null,
//       methodologies: null,
//       organizationalBoundaries: null,
//       organizationalDiagram: null,

//       // category buckets
//       stationaryCombustion: null,
//       mobileCombustion: null,
//       processSources: null,
//       fugitiveSources: null,
//       agriculturalSources: null,
//       electricity: null,
//       steam: null,
//       heating: null,
//       cooling: null,
//       purchased_goods_services: null,
//       capital_goods: null,
//       fuel_energy_related: null,
//       upstream_transport_distribution: null,
//       waste_generated: null,
//       business_travel: null,
//       employee_commuting: null,
//       upstream_leased_assets: null,
//       downstream_transport_distribution: null,
//       processing_sold_products: null,
//       use_sold_products: null,
//       end_of_life_sold_products: null,
//       downstream_leased_assets: null,
//       franchises: null,
//       investments: null,

//       facilityEmissions: null,
//       countryEmissions: null,
//       ownGenerationEmissions: null,
//       purchasedForResaleEmissions: null,
//       nonKyotoEmissions: null,
//       emissionChangeCauses: null,
//       historicalEmissions: null,
//       performanceIndicators: null,
//       managementPrograms: null,
//       contractualProvisions: null,
//       externalAssurance: null,
//       inventoryQuality: null,
//       sequestrationInfo: null,
//       offsetsOutsideBoundary: null,
//       offsetsInsideBoundary: null
//     });

//     const pdfPayload = buildPdfSkeleton();

//     // -----------------------
//     // populate common fields from first row
//     // -----------------------
//     const first = rows[0];
//     if (first) {
//       pdfPayload.companyName = first.project_name || null;
//       pdfPayload.companyLogoUrl = first.facility_logo || null;

//       // pdfPayload.periodFrom = first.reporting_period_start ? first.reporting_period_start.split("T")[0] : null;
//       pdfPayload.periodFrom = first.reporting_period_start ? new Date(first.reporting_period_start).toISOString().split("T")[0] : null;
//       pdfPayload.periodTo = first.reporting_period_end ? new Date(first.reporting_period_end).toISOString().split("T")[0] : null;
//       // pdfPayload.periodTo = first.reporting_period_end ? first.reporting_period_end.split("T")[0] : null;
//       pdfPayload.inventoryYear = first.reporting_period_start ? String(new Date(first.reporting_period_start).getFullYear()) : null;

//       pdfPayload.organizationalBoundaries = first.organizational_boundaries || null;
//       pdfPayload.baseYearEmissions = first.base_year_emissions || null;

//       pdfPayload.methodologies = first.methodologies_references || null;
//       pdfPayload.organizationalDiagram = first.organisational_diagram || null;
//       pdfPayload.contractualProvisions = first.contractual_provisions || null;
//       pdfPayload.externalAssurance = first.external_assurance || null;
//       pdfPayload.inventoryQuality = first.inventory_uncertainty || null;
//       pdfPayload.sequestrationInfo = first.ghg_sequestration || null;
//       pdfPayload.exclusions = first.excluded_facilities || null;
//       pdfPayload.nonKyotoEmissions = first.non_ghg_methodologies || null;
//       pdfPayload.baseYearPolicy = first.policy_recalculation || null;
//     }

//     // -----------------------
//     // aggregate totals and map categories
//     // -----------------------
//     let scope1Total = 0;
//     let scope2Total = 0;
//     let scope3Total = 0;
//     const facilityEmissions = [];

//     for (const r of rows) {
//       const apiCategory = r.main_category || r.category || "";
//       const numericTotal = (r.total_carbon_emission !== undefined && r.total_carbon_emission !== null)
//         ? Number(r.total_carbon_emission)
//         : null;

//       // scope totals
//       if (r.scope_name && typeof numericTotal === "number" && !isNaN(numericTotal)) {
//         if (/Scope\s*1/i.test(r.scope_name)) scope1Total += numericTotal;
//         else if (/Scope\s*2/i.test(r.scope_name)) scope2Total += numericTotal;
//         else if (/Scope\s*3/i.test(r.scope_name)) scope3Total += numericTotal;
//       }

//       // map category -> pdf key (exact or fuzzy)
//       if (apiCategory) {
//         let pdfKey = categoryMap[apiCategory];

//         if (!pdfKey) {
//           // fuzzy: check if apiCategory contains known words from map keys
//           const ak = apiCategory.toLowerCase();
//           for (const [k, v] of Object.entries(categoryMap)) {
//             if (k.toLowerCase().includes(ak) || ak.includes(k.toLowerCase()) || ak.includes(k.toLowerCase().split(' ')[0])) {
//               pdfKey = v;
//               break;
//             }
//           }
//         }

//         if (pdfKey) {
//           pdfPayload[pdfKey] = (numericTotal !== null && !isNaN(numericTotal)) ? `${numericTotal} mtCO2e` : null;
//           if (r.unit_name) pdfPayload[`${pdfKey}_unit`] = r.unit_name;
//         }
//       }

//       // facility-level (optional)
//       if (r.facility_name || r.facility_logo) {
//         facilityEmissions.push({
//           facility: r.facility_name || r.project_name || null,
//           scope1Emissions: (r.scope_name && /Scope\s*1/i.test(r.scope_name) && numericTotal !== null) ? `${numericTotal} mtCO2e` : null
//         });
//       }
//     }

//     // fill missing category keys with null (you asked missing -> null)
//     Object.values(categoryMap).forEach((k) => {
//       if (pdfPayload[k] === undefined) pdfPayload[k] = null;
//       if (pdfPayload[`${k}_unit`] === undefined) pdfPayload[`${k}_unit`] = null;
//     });

//     pdfPayload.facilityEmissions = facilityEmissions.length ? facilityEmissions : null;

//     // set scope totals as strings (or null if zero and you prefer null)
//     pdfPayload.emissions.scope1Total = scope1Total !== 0 ? String(scope1Total) : "0";
//     pdfPayload.emissions.scope2Total = scope2Total !== 0 ? String(scope2Total) : "0";
//     pdfPayload.emissions.scope3Total = scope3Total !== 0 ? String(scope3Total) : "0";

//     // set scope base gases if base_year_emissions exists (take values from first.base_year_emissions)
//     if (first && Array.isArray(first.base_year_emissions)) {
//       const b1 = first.base_year_emissions.find(b => /Scope\s*1/i.test(b.scope)) || {};
//       const b2 = first.base_year_emissions.find(b => /Scope\s*2/i.test(b.scope)) || {};
//       const b3 = first.base_year_emissions.find(b => /Scope\s*3/i.test(b.scope)) || {};

//       pdfPayload.emissions.scope1CO2 = b1.co2_mt ?? null;
//       pdfPayload.emissions.scope1CH4 = b1.ch4_mt ?? null;
//       pdfPayload.emissions.scope1N2O = b1.n2o_mt ?? null;
//       pdfPayload.emissions.scope1SF6 = b1.sf6_mt ?? null;
//       pdfPayload.emissions.scope1HFCs = b1.hfcs_mt ?? null;
//       pdfPayload.emissions.scope1PFCs = b1.pfcs_mt ?? null;

//       pdfPayload.emissions.scope2CO2 = b2.co2_mt ?? null;
//       pdfPayload.emissions.scope2CH4 = b2.ch4_mt ?? null;
//       pdfPayload.emissions.scope2N2O = b2.n2o_mt ?? null;
//       pdfPayload.emissions.scope2SF6 = b2.sf6_mt ?? null;
//       pdfPayload.emissions.scope2HFCs = b2.hfcs_mt ?? null;
//       pdfPayload.emissions.scope2PFCs = b2.pfcs_mt ?? null;

//       pdfPayload.emissions.scope3CO2 = b3.co2_mt ?? null;
//       pdfPayload.emissions.scope3CH4 = b3.ch4_mt ?? null;
//       pdfPayload.emissions.scope3N2O = b3.n2o_mt ?? null;
//       pdfPayload.emissions.scope3SF6 = b3.sf6_mt ?? null;
//       pdfPayload.emissions.scope3HFCs = b3.hfcs_mt ?? null;
//       pdfPayload.emissions.scope3PFCs = b3.pfcs_mt ?? null;
//     }

//     // -----------------------
//     // call existing /generate_pdf endpoint (app.js)
//     // -----------------------
//     let generatePdfResult = null;
//     try {
        
//       const pdfBuffer = await this.generate_pdf(pdfPayload);

//       // 4️⃣ Send PDF as attachment
//       const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
//       const filename = `GHG-Protocol-Report-${timestamp}.pdf`;

//       res.setHeader("Content-Type", "application/pdf");
//       res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
//       res.setHeader("Content-Length", pdfBuffer.length);
//       return res.send(pdfBuffer);

//     } catch (err) {
//       console.error("Error calling generate_pdf:", err);
//       generatePdfResult = { ok: false, error: err.message || String(err) };
//     }

//     // -----------------------
//     // return DB rows + generatePdfCall info
//     // -----------------------
//     return this.utility.response.init(
//       res,
//       true,
//       "get_project_category_carbon_with_facilities successfully",
//       {
//         templates: rows,
//         count: rows.length,
//         generatePdfCall: generatePdfResult
//       }
//     );

//   } catch (error) {
//     console.error("Error fetching templates:", error);
//     return this.utility.response.init(
//       res,
//       false,
//       "Internal server error while fetching templates",
//       {
//         error: "INTERNAL_SERVER_ERROR",
//         details: error.message
//       },
//       500
//     );
//   }
// };



get_project_category_carbon_with_facilities = async (req, res) => {
  try {
    const { p_project_id } = req.body;

    const query = {
      text: "SELECT * FROM get_project_category_carbon_with_facilities($1)",
      values: [p_project_id],
    };

    const result = await this.utility.sql.query(query);

    if (!result.rows) {
      return this.utility.response.init(
        res,
        false,
        "No response from database",
        { error: "DATABASE_ERROR" },
        500
      );
    }

    const rows = result.rows;

    console.log(rows);

    // -----------------------
    // category mapping => generate_pdf keys
    // -----------------------
    const categoryMap = {
      // Scope 1
      "Direct Emissions from Stationary Combustion": "stationaryCombustion",
      "Direct Emissions from Mobile Combustion": "mobileCombustion",
      "Direct Emissions from Process Sources": "processSources",
      "Direct Emissions from Fugitive Sources": "fugitiveSources",
      "Direct Emissions from Agricultural Sources": "agriculturalSources",

      // Scope 2 common names
      "Indirect Emissions from Purchased/Acquired Electricity": "electricity",
      "Indirect Emissions from Purchased/Acquired Steam": "steam",
      "Indirect Emissions from Purchased/Acquired Heating": "heating",
      "Indirect Emissions from Purchased/Acquired Cooling": "cooling",
      "Indirect Emission (Electricity)": "electricity",
      "Electricity": "electricity",

      // Scope 3 (various names)
      "Category 1: Purchased goods and services": "purchased_goods_services",
      "Purchased Goods & Services": "purchased_goods_services",
      "Capital Goods": "capital_goods",
      "Fuel & Energy Related Activities": "fuel_energy_related",
      "Category 4: Upstream transportation and distribution": "upstream_transport_distribution",
      "Upstream Transportation & Distribution": "upstream_transport_distribution",
      "Category 5: Waste generated in operations": "waste_generated",
      "Waste Generated in Operations": "waste_generated",
      "Business Travel": "business_travel",
      "Employee Commuting": "employee_commuting",
      "Upstream Leased Assets": "upstream_leased_assets",
      "Downstream Transportation & Distribution": "downstream_transport_distribution",
      "Processing of Sold Products": "processing_sold_products",
      "Use of Sold Products": "use_sold_products",
      "End-of-Life Treatment of Sold Products": "end_of_life_sold_products",
      "Downstream Leased Assets": "downstream_leased_assets",
      "Franchises": "franchises",
      "Investments": "investments"
    };

    // -----------------------
    // build pdf payload skeleton with null defaults
    // -----------------------
    const buildPdfSkeleton = () => ({
      companyName: null,
      inventoryYear: null,
      companyLogoUrl: null,
      verified: null,
      verificationDate: null,
      verifier: null,
      verifierEmail: null,
      verifierPhone: null,
      verifierAddress: null,
      exclusions: null,
      periodFrom: null,
      periodTo: null,
      equityShare: null,
      financialControl: null,
      operationalControl: null,
      scope3Included: null,
      scope3Activities: null,
      emissions: {
        scope1Total: null, scope1CO2: null, scope1CH4: null, scope1N2O: null,
        scope1HFCs: null, scope1PFCs: null, scope1SF6: null,
        scope2Total: null, scope2CO2: null, scope2CH4: null, scope2N2O: null,
        scope2HFCs: null, scope2PFCs: null, scope2SF6: null,
        scope3Total: null, scope3CO2: null, scope3CH4: null, scope3N2O: null,
        scope3HFCs: null, scope3PFCs: null, scope3SF6: null
      },
      biogenicEmissions: null,
      baseYear: null,
      baseYearPolicy: null,
      baseYearContext: null,
      baseYearEmissions: null,
      methodologies: null,
      organizationalBoundaries: null,
      organizationalDiagram: null,

      // category buckets
      stationaryCombustion: null,
      mobileCombustion: null,
      processSources: null,
      fugitiveSources: null,
      agriculturalSources: null,
      electricity: null,
      steam: null,
      heating: null,
      cooling: null,
      purchased_goods_services: null,
      capital_goods: null,
      fuel_energy_related: null,
      upstream_transport_distribution: null,
      waste_generated: null,
      business_travel: null,
      employee_commuting: null,
      upstream_leased_assets: null,
      downstream_transport_distribution: null,
      processing_sold_products: null,
      use_sold_products: null,
      end_of_life_sold_products: null,
      downstream_leased_assets: null,
      franchises: null,
      investments: null,

      facilityEmissions: null,
      countryEmissions: null,
      ownGenerationEmissions: null,
      purchasedForResaleEmissions: null,
      nonKyotoEmissions: null,
      emissionChangeCauses: null,
      historicalEmissions: null,
      performanceIndicators: null,
      managementPrograms: null,
      contractualProvisions: null,
      externalAssurance: null,
      inventoryQuality: null,
      sequestrationInfo: null,
      offsetsOutsideBoundary: null,
      offsetsInsideBoundary: null
    });

    const pdfPayload = buildPdfSkeleton();

    // -----------------------
    // populate common fields from first row
    // -----------------------
    const first = rows[0];
    if (first) {
      pdfPayload.companyName = first.project_name || null;
      pdfPayload.companyLogoUrl = first.facility_logo || null;

      pdfPayload.periodFrom = first.reporting_period_start ? new Date(first.reporting_period_start).toISOString().split("T")[0] : null;
      pdfPayload.periodTo = first.reporting_period_end ? new Date(first.reporting_period_end).toISOString().split("T")[0] : null;
      pdfPayload.inventoryYear = first.reporting_period_start ? String(new Date(first.reporting_period_start).getFullYear()) : null;

      pdfPayload.organizationalBoundaries = first.organizational_boundaries || null;
      pdfPayload.baseYearEmissions = first.base_year_emissions || null;

      pdfPayload.methodologies = first.methodologies_references || null;
      pdfPayload.organizationalDiagram = first.organisational_diagram || null;
      pdfPayload.contractualProvisions = first.contractual_provisions || null;
      pdfPayload.externalAssurance = first.external_assurance || null;
      pdfPayload.inventoryQuality = first.inventory_uncertainty || null;
      pdfPayload.sequestrationInfo = first.ghg_sequestration || null;
      pdfPayload.exclusions = first.excluded_facilities || null;
      pdfPayload.nonKyotoEmissions = first.non_ghg_methodologies || null;
      pdfPayload.baseYearPolicy = first.policy_recalculation || null;
    }

    // -----------------------
    // aggregate totals and map categories
    // -----------------------
    let scope1Total = 0;
    let scope2Total = 0;
    let scope3Total = 0;
    const facilityEmissions = [];

    for (const r of rows) {
      const apiCategory = r.main_category || r.category || "";
      const numericTotal = (r.total_carbon_emission !== undefined && r.total_carbon_emission !== null)
        ? Number(r.total_carbon_emission)
        : null;

      // scope totals
      if (r.scope_name && typeof numericTotal === "number" && !isNaN(numericTotal)) {
        if (/Scope\s*1/i.test(r.scope_name)) scope1Total += numericTotal;
        else if (/Scope\s*2/i.test(r.scope_name)) scope2Total += numericTotal;
        else if (/Scope\s*3/i.test(r.scope_name)) scope3Total += numericTotal;
      }

      // map category -> pdf key (exact or fuzzy)
      if (apiCategory) {
        let pdfKey = categoryMap[apiCategory];

        if (!pdfKey) {
          // fuzzy: check if apiCategory contains known words from map keys
          const ak = apiCategory.toLowerCase();
          for (const [k, v] of Object.entries(categoryMap)) {
            if (k.toLowerCase().includes(ak) || ak.includes(k.toLowerCase()) || ak.includes(k.toLowerCase().split(' ')[0])) {
              pdfKey = v;
              break;
            }
          }
        }

        if (pdfKey) {
          pdfPayload[pdfKey] = (numericTotal !== null && !isNaN(numericTotal)) ? `${numericTotal} mtCO2e` : null;
          if (r.unit_name) pdfPayload[`${pdfKey}_unit`] = r.unit_name;
        }
      }

      // facility-level (optional)
      if (r.facility_name || r.facility_logo) {
        facilityEmissions.push({
          facility: r.facility_name || r.project_name || null,
          scope1Emissions: (r.scope_name && /Scope\s*1/i.test(r.scope_name) && numericTotal !== null) ? `${numericTotal} mtCO2e` : null
        });
      }
    }

    // fill missing category keys with null
    Object.values(categoryMap).forEach((k) => {
      if (pdfPayload[k] === undefined) pdfPayload[k] = null;
      if (pdfPayload[`${k}_unit`] === undefined) pdfPayload[`${k}_unit`] = null;
    });

    pdfPayload.facilityEmissions = facilityEmissions.length ? facilityEmissions : null;

    // set scope totals as strings
    pdfPayload.emissions.scope1Total = scope1Total !== 0 ? String(scope1Total) : "0";
    pdfPayload.emissions.scope2Total = scope2Total !== 0 ? String(scope2Total) : "0";
    pdfPayload.emissions.scope3Total = scope3Total !== 0 ? String(scope3Total) : "0";

    // set scope base gases if base_year_emissions exists
    if (first && Array.isArray(first.base_year_emissions)) {
      const b1 = first.base_year_emissions.find(b => /Scope\s*1/i.test(b.scope)) || {};
      const b2 = first.base_year_emissions.find(b => /Scope\s*2/i.test(b.scope)) || {};
      const b3 = first.base_year_emissions.find(b => /Scope\s*3/i.test(b.scope)) || {};

      pdfPayload.emissions.scope1CO2 = b1.co2_mt ?? null;
      pdfPayload.emissions.scope1CH4 = b1.ch4_mt ?? null;
      pdfPayload.emissions.scope1N2O = b1.n2o_mt ?? null;
      pdfPayload.emissions.scope1SF6 = b1.sf6_mt ?? null;
      pdfPayload.emissions.scope1HFCs = b1.hfcs_mt ?? null;
      pdfPayload.emissions.scope1PFCs = b1.pfcs_mt ?? null;

      pdfPayload.emissions.scope2CO2 = b2.co2_mt ?? null;
      pdfPayload.emissions.scope2CH4 = b2.ch4_mt ?? null;
      pdfPayload.emissions.scope2N2O = b2.n2o_mt ?? null;
      pdfPayload.emissions.scope2SF6 = b2.sf6_mt ?? null;
      pdfPayload.emissions.scope2HFCs = b2.hfcs_mt ?? null;
      pdfPayload.emissions.scope2PFCs = b2.pfcs_mt ?? null;

      pdfPayload.emissions.scope3CO2 = b3.co2_mt ?? null;
      pdfPayload.emissions.scope3CH4 = b3.ch4_mt ?? null;
      pdfPayload.emissions.scope3N2O = b3.n2o_mt ?? null;
      pdfPayload.emissions.scope3SF6 = b3.sf6_mt ?? null;
      pdfPayload.emissions.scope3HFCs = b3.hfcs_mt ?? null;
      pdfPayload.emissions.scope3PFCs = b3.pfcs_mt ?? null;
    }

    // 🔧 ADD CONSOLE LOG TO DEBUG
    console.log("📊 PDF Payload being sent:", JSON.stringify(pdfPayload, null, 2));

    // -----------------------
    // call generate_pdf with proper request format
    // -----------------------
    let generatePdfResult = null;
    try {
      // 🔥 FIX: Create a mock request object with body containing pdfPayload
      const mockReq = {
        body: pdfPayload
      };
      
      const pdfBuffer = await this.generate_pdf(mockReq, res);

      // Send PDF as attachment
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `GHG-Protocol-Report-${timestamp}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", pdfBuffer.length);
      return res.send(pdfBuffer);

    } catch (err) {
      console.error("Error calling generate_pdf:", err);
      generatePdfResult = { ok: false, error: err.message || String(err) };
    }

    // return DB rows + generatePdfCall info
    return this.utility.response.init(
      res,
      true,
      "get_project_category_carbon_with_facilities successfully",
      {
        templates: rows,
        count: rows.length,
        generatePdfCall: generatePdfResult
      }
    );

  } catch (error) {
    console.error("Error fetching templates:", error);
    return this.utility.response.init(
      res,
      false,
      "Internal server error while fetching templates",
      {
        error: "INTERNAL_SERVER_ERROR",
        details: error.message
      },
      500
    );
  }
};

 





 
generate_pdf = async (req, res) => {
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
        // if (data.employee_commuting) detailedEmissions.push({
        //   label: "7. Employee Commuting",
        //   value: data.employee_commuting
        // });
        // if (data.upstream_leased_assets) detailedEmissions.push({
        //   label: "8. Upstream Leased Assets",
        //   value: data.upstream_leased_assets
        // });
      }

      // Check if we need to split across pages (more than 25 rows)
      if (detailedEmissions.length <= 2) {
      // if (detailedEmissions.length <= 25) {
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

        if (data.employee_commuting) remainingEmissions.push({
          label: "7. Employee Commuting",
          value: data.employee_commuting
        });
        if (data.upstream_leased_assets) remainingEmissions.push({
          label: "8. Upstream Leased Assets",
          value: data.upstream_leased_assets
        });

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
 return Buffer.from(pdfBytes);
// const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
// const filename = `GHG-Protocol-Report-${timestamp}.pdf`;

// this.utility.res.setHeader("Content-Type", "application/pdf");
// this.utility.res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
// this.utility.res.setHeader("Content-Length", pdfBytes.length);
// this.utility.res.send(Buffer.from(pdfBytes));
} catch (err) {
console.log(err);
// this.utility.res.status(500).json({ error: "PDF generation failed", detail: err.message });
return this.utility.response.init(res, false, "Internal server error while creating project", {
        error: "INTERNAL_SERVER_ERROR",
        details: err.message
      }, 500);
}
 
}








  

  CreateProject = async (req, res) => {
    try {
      const {
        facility_id,
        project_name,
        project_description,
        reporting_period_start,
        reporting_period_end,
        responsible_party,
        intended_user,
        intended_use_of_inventory,
        organisational_boundary_type,
        reporting_protocol,
        base_year,
        team_member_ids
      } = req.body;

      // const creator_user_id = req.user.userId; // From JWT token
      const creator_user_id = 15; // From JWT token

      // Call the PostgreSQL function
      const query = {
        text: 'SELECT * FROM create_project($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,$15,$16,$17,$18,$19,$20,$21)',
        values: [
          creator_user_id,
          facility_id,
          project_name,
          project_description,
          reporting_period_start,
          reporting_period_end,
          responsible_party,
          intended_user,
          intended_use_of_inventory,
          organisational_boundary_type,
          reporting_protocol,
          base_year,
          team_member_ids || null,



          req.body.recalculation,       // $14
          req.body.changes,             // $15
          req.body.methodologies,       // $16
          req.body.references,          // $17
          req.body.sources,             // $18
          req.body.risks,               // $19
          req.body.assurance,           // $20
          req.body.inventory            // $21
        ]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows || result.rows.length === 0) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      const { new_project_id, status_message } = result.rows[0];

      if (new_project_id) {
        return this.utility.response.init(res, true, status_message, {
          project_id: new_project_id,
          project_name,
          facility_id,
          creator_user_id,
          team_members_added: team_member_ids ? team_member_ids.length : 0,
          reporting_period: {
            start: reporting_period_start,
            end: reporting_period_end
          }
        }, 201);
      } else {
        // Handle database errors (overlapping projects, etc.)
        return this.utility.response.init(res, false, status_message, {
          error: "PROJECT_CREATION_FAILED"
        }, 400);
      }

    } catch (error) {
      console.error('Error creating project:', error);
      return this.utility.response.init(res, false, "Internal server error while creating project", {
        error: "INTERNAL_SERVER_ERROR",
        details: error.message
      }, 500);
    }
  };


}

module.exports = Templates;