class ProjectActivities {
  constructor(_utility) {
    this.utility = _utility;
  }

  AddActivityToProject = async (req, res) => {
    try {
      const { projectId, subcategoryId, frequency } = req.body;
      // Basic validations
      if (
        projectId === undefined ||
        subcategoryId === undefined ||
        frequency === undefined
      ) {
        return this.utility.response.init(res, false, "projectId, subcategoryId and frequency are required");
      }

      const p_project_id = Number(projectId);
      const p_subcategory_id = Number(subcategoryId);
      const p_frequency = String(frequency).trim();

      if (!Number.isInteger(p_project_id) || p_project_id <= 0) {
        return this.utility.response.init(res, false, "projectId must be a positive integer");
      }
      if (!Number.isInteger(p_subcategory_id) || p_subcategory_id <= 0) {
        return this.utility.response.init(res, false, "subcategoryId must be a positive integer");
      }
      if (!p_frequency) {
        return this.utility.response.init(res, false, "frequency must be a non-empty string");
      }

      const query = {
        text: 'SELECT * FROM public.add_activity_row_to_project($1, $2, $3)',
        values: [p_project_id, p_subcategory_id, p_frequency]
      };

      const result = await this.utility.sql.query(query);
      const row = result?.rows?.[0];

      if (!row) {
        return this.utility.response.init(res, false, "No response from database function");
      }
      const { new_project_activity_id, status_message } = row;

      const success = Boolean(new_project_activity_id) && status_message?.toLowerCase().includes('success');

      return this.utility.response.init(
        res,
        success,
        status_message || (success ? "Activity row added successfully." : "Failed to add activity row."),
        {
          new_project_activity_id: new_project_activity_id || null
        }
      );
    } catch (err) {
      const message = err?.message || "An unexpected error occurred.";
      return this.utility.response.init(res, false, "Activity creation failed", { error: message });
    }
  };

  CheckUnresolvedFlags = async (req, res) => {
    try {
      const { project_id, scope_name } = req.body;

      // Basic validations
      if (project_id === undefined || scope_name === undefined) {
        return this.utility.response.init(res, false, "project_id and scope_name are required");
      }

      const p_project_id = Number(project_id);
      const p_scope_name = String(scope_name).trim();

      if (!Number.isInteger(p_project_id) || p_project_id <= 0) {
        return this.utility.response.init(res, false, "project_id must be a positive integer");
      }
      if (!p_scope_name) {
        return this.utility.response.init(res, false, "scope_name must be a non-empty string");
      }

      const query = {
        text: 'SELECT * FROM public.check_for_unresolved_flags($1, $2)',
        values: [p_project_id, p_scope_name]
      };

      const result = await this.utility.sql.query(query);
      const row = result?.rows?.[0];

      if (row === undefined) {
        return this.utility.response.init(res, false, "No response from database function");
      }

      const unresolvedCount = row.check_for_unresolved_flags || 0;

      return this.utility.response.init(
        res,
        true,
        "Unresolved flags count retrieved successfully",
        {
          project_id: p_project_id,
          scope_name: p_scope_name,
          unresolved_flags_count: unresolvedCount
        }
      );
    } catch (err) {
      const message = err?.message || "An unexpected error occurred.";
      return this.utility.response.init(res, false, "Failed to check unresolved flags", { error: message });
    }
  };

  CreateProjectRequest = async (req, res) => {
    try {
      const { project_id, assignee_id, request_type, title, description } = req.body;
      const creator_id = req.user.userId; // From JWT token

      // Call the PostgreSQL function
      const query = {
        text: 'SELECT create_new_project_request($1, $2, $3, $4, $5, $6) as new_task_id',
        values: [creator_id, project_id, assignee_id, request_type, title, description || null]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows || result.rows.length === 0) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      const { new_task_id } = result.rows[0];

      if (new_task_id) {
        return this.utility.response.init(res, true, "Project request created successfully", {
          task_id: new_task_id,
          project_id,
          assignee_id,
          request_type,
          title,
          creator_id
        }, 201);
      } else {
        return this.utility.response.init(res, false, "Failed to create project request", {
          error: "TASK_CREATION_FAILED"
        }, 400);
      }

    } catch (error) {
      console.error('Error creating project request:', error);
      return this.utility.response.init(res, false, "Internal server error while creating project request", {
        error: "INTERNAL_SERVER_ERROR",
        details: error.message
      }, 500);
    }
  };





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





  CustomizeActiveScopes = async (req, res) => {
    try {
      const { project_id, active_scopes } = req.body;
      const user_id = req.user.userId; // From JWT token

      // Call the PostgreSQL function
      const query = {
        text: 'SELECT customize_active_scopes_for_project($1, $2) as status_message',
        values: [project_id, active_scopes]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows || result.rows.length === 0) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      const { status_message } = result.rows[0];

      if (status_message) {
        return this.utility.response.init(res, true, status_message, {
          project_id,
          active_scopes,
          scopes_count: active_scopes.length,
          updated_by: user_id
        }, 200);
      } else {
        return this.utility.response.init(res, false, "Failed to update project scopes", {
          error: "SCOPE_UPDATE_FAILED"
        }, 400);
      }

    } catch (error) {
      console.error('Error customizing active scopes:', error);
      return this.utility.response.init(res, false, "Internal server error while updating project scopes", {
        error: "INTERNAL_SERVER_ERROR",
        details: error.message
      }, 500);
    }
  };

  GetActivitiesForSubcategory = async (req, res) => {
    try {
      const { main_category_id, subcategory_name } = req.query;

      // Call the PostgreSQL function
      const query = {
        text: 'SELECT * FROM get_activities_for_subcategory($1, $2)',
        values: [main_category_id, subcategory_name]
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
        "Activities retrieved successfully",
        {
          activities: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching activities:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching activities",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  GetAllRequestsForUser = async (req, res) => {
    try {
      console.log("🟢 Incoming /user/requests request");
      console.log("user:", req.user);
      const user_id = req.user.userId; // Get from JWT token

      const query = {
        text: 'SELECT * FROM get_all_requests_for_user($1)',
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
        "User requests retrieved successfully",
        {
          requests: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching user requests:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching user requests",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  GetAssignableUsers = async (req, res) => {
    try {
      const requester_id = req.user.userId; // Get from JWT token

      const query = {
        text: 'SELECT * FROM get_assignable_users_for_request($1)',
        values: [requester_id]
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
        "Assignable users retrieved successfully",
        {
          users: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching assignable users:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching assignable users",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  GetDataCollectionSheetForScope = async (req, res) => {
    try {
      const { project_id, scope_name, page_size, page_number } = req.query;

      const query = {
        text: 'SELECT * FROM get_data_collection_sheet_for_scope($1, $2, $3, $4)',
        values: [project_id, scope_name, page_size, page_number]
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
        "Data collection sheet retrieved successfully",
        {
          data: result.rows,
          count: result.rows.length,
          pagination: {
            page: parseInt(page_number, 10),
            page_size: parseInt(page_size, 10),
            total: result.rows.length
          }
        }
      );

    } catch (error) {
      console.error('Error fetching data collection sheet:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching data collection sheet",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  GetDataForExport = async (req, res) => {
    try {
      const { project_id, scope_name } = req.query;

      const query = {
        text: 'SELECT * FROM get_data_for_export($1, $2)',
        values: [project_id, scope_name]
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
        "Export data retrieved successfully",
        {
          data: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching export data:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching export data",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  GetMainCategoriesForScopeAndSource = async (req, res) => {
    try {
      const { scope, source } = req.query;

      const query = {
        text: 'SELECT * FROM get_main_categories_for_scope_and_source($1, $2)',
        values: [scope, source]
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
        "Main categories retrieved successfully",
        {
          categories: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching main categories:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching main categories",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  GetPreviewDataForScope = async (req, res) => {
    try {
      const { project_id, scope_name } = req.query;

      const query = {
        text: 'SELECT * FROM get_preview_data_for_scope($1, $2)',
        values: [project_id, scope_name]
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
        "Preview data retrieved successfully",
        {
          data: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching preview data:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching preview data",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  GetSelection1ForActivity = async (req, res) => {
    try {
      const { main_category_id, subcategory_name, activity_name } = req.query;

      const query = {
        text: 'SELECT * FROM get_selection1_for_activity($1, $2, $3)',
        values: [main_category_id, subcategory_name, activity_name]
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
        "Selection 1 options retrieved successfully",
        {
          options: result.rows.map(row => row.selection_1_name),
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching selection 1 options:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching selection 1 options",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  GetSelection2ForSelection1 = async (req, res) => {
    try {
      const {
        main_category_id,
        subcategory_name,
        activity_name,
        selection_1_name
      } = req.query;

      const query = {
        text: 'SELECT * FROM get_selection2_for_selection1($1, $2, $3, $4)',
        values: [main_category_id, subcategory_name, activity_name, selection_1_name]
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
        "Selection 2 options retrieved successfully",
        {
          options: result.rows.map(row => row.selection_2_name),
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching selection 2 options:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching selection 2 options",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  GetSubcategoriesForMainCategory = async (req, res) => {
    try {
      const { main_category_id } = req.query;

      const query = {
        text: 'SELECT * FROM get_subcategories_for_main_category($1)',
        values: [main_category_id]
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
        "Subcategories retrieved successfully",
        {
          subcategories: result.rows.map(row => row.subcategory_name),
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching subcategories",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  // InitializeNewProject = async (req, res) => {
  //   try {
  //     const creator_user_id = req.user.userId;
  //     const {
  //       facility_id,
  //       project_name,
  //       project_description = '',
  //       reporting_period_start,
  //       reporting_period_end,
  //       responsible_party,
  //       intended_user,
  //       intended_use_of_inventory = '',
  //       organisational_boundary_type,
  //       reporting_protocol,
  //       base_year,
  //       industry,
  //       // team_member_ids = []
  //       team_assignments
  //     } = req.body;

  //     // Convert date strings to Date objects if they're strings
  //     const startDate = new Date(reporting_period_start);
  //     const endDate = new Date(reporting_period_end);
  //     console.log("Start Date = ",startDate)
  //     console.log("End Date = ",endDate)
  //     const query = {
  //       text: 'SELECT * FROM initialize_new_project_with_members($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
  //       values: [
  //         creator_user_id,
  //         facility_id,
  //         project_name,
  //         project_description,
  //         startDate,
  //         endDate,
  //         responsible_party,
  //         intended_user,
  //         intended_use_of_inventory,
  //         organisational_boundary_type,
  //         reporting_protocol,
  //         base_year,
  //         industry,
  //         // team_member_ids
  //         JSON.stringify(team_assignments)
  //       ]
  //     };
  //     const result = await this.utility.sql.query(query);
  //     console.log("Result = ", result)
  //     if (!result.rows || result.rows.length === 0) {
  //       return this.utility.response.init(res, false, "Project creation failed", {
  //         error: "PROJECT_CREATION_FAILED"
  //       }, 400);
  //     }

  //     const { new_project_id, status_message } = result.rows[0];

  //     if (!new_project_id) {
  //       return this.utility.response.init(res, false, status_message || "Project creation failed", {
  //         error: "PROJECT_CREATION_FAILED"
  //       }, 400);
  //     }

  //     return this.utility.response.init(
  //       res,
  //       true,
  //       status_message || "Project created successfully",
  //       {
  //         project_id: new_project_id,
  //         project_name,
  //         facility_id,
  //         creator_user_id,
  //         industry,
  //         // team_members_added: team_member_ids.length,
  //         team_members_added: team_assignments.length,
  //         reporting_period: {
  //           start: reporting_period_start,
  //           end: reporting_period_end
  //         }
  //       },
  //       201
  //     );

  //   } catch (error) {
  //     console.error('Error creating project:', error);
  //     return this.utility.response.init(
  //       res,
  //       false,
  //       error.message.includes('overlapping') ? error.message : "Internal server error while creating project",
  //       {
  //         error: error.message.includes('overlapping') ? "OVERLAPPING_PROJECT" : "INTERNAL_SERVER_ERROR",
  //         details: error.message
  //       },
  //       error.message.includes('overlapping') ? 400 : 500
  //     );
  //   }
  // };




  InitializeNewProject = async (req, res) => {
  try {
    const creator_user_id = req.user.userId;
    const {
      // Original fields
      facility_id,
      project_name,
      project_description = '',
      reporting_period_start,
      reporting_period_end,
      responsible_party,
      intended_user,
      intended_use_of_inventory = '',
      organisational_boundary_type,
      reporting_protocol,
      base_year,
      team_assignments = [],
      
      // New fields for base year emissions and organizational boundaries
      base_year_emissions = [],
      org_boundaries = [],
      
      // New emissions reporting fields
      base_year_recalculation_policy = null,
      context_for_significant_changes = null,
      non_ghg_methodologies = null,
      methodologies_references = null,
      excluded_facilities = null,
      contractual_provisions = null,
      external_assurance = null,
      inventory_uncertainty = null,
      ghg_sequestration = null,
      organisational_diagram = null,
                                        
    } = req.body;

    const industry = 'Transportation & Logistics'

    const facilityIdInt = parseInt(facility_id);


    // Convert date strings to Date objects if they're strings
    const startDate = new Date(reporting_period_start);
    const endDate = new Date(reporting_period_end);
    
    console.log("Start Date = ", startDate);
    console.log("End Date = ", endDate);

    // Prepare the SQL query with all parameters
    const query = {
      text: `SELECT * FROM initialize_new_project_with_members(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
      )`,
      values: [
        creator_user_id,                          // $1
        // facility_id,                              // $2
        facilityIdInt,                              // $2
        project_name,                             // $3
        project_description,                      // $4
        startDate,                                // $5
        endDate,                                  // $6
        responsible_party,                        // $7
        intended_user,                            // $8
        intended_use_of_inventory,                // $9
        organisational_boundary_type,             // $10
        reporting_protocol,                       // $11
        base_year,                                // $12
        team_assignments,                         // $13 - Array of user IDs
        JSON.stringify(base_year_emissions),      // $14 - JSONB array
        JSON.stringify(org_boundaries),           // $15 - JSONB array
        base_year_recalculation_policy,           // $16
        context_for_significant_changes,          // $17
        non_ghg_methodologies,                    // $18
        methodologies_references,                 // $19
        excluded_facilities,                      // $20
        contractual_provisions,                   // $21
        external_assurance,                       // $22
        inventory_uncertainty,                    // $23
        ghg_sequestration,                        // $24
        organisational_diagram,                    // $25
        industry                                  
      ]
    };

    const result = await this.utility.sql.query(query);
    console.log("Result = ", result);

    if (!result.rows || result.rows.length === 0) {
      return this.utility.response.init(res, false, "Project creation failed", {
        error: "PROJECT_CREATION_FAILED"
      }, 400);
    }

    const { new_project_id, status_message } = result.rows[0];

    if (!new_project_id) {
      return this.utility.response.init(res, false, status_message || "Project creation failed", {
        error: "PROJECT_CREATION_FAILED",
        details: status_message
      }, 400);
    }

    return this.utility.response.init(
      res,
      true,
      status_message || "Project created successfully",
      {
        project_id: new_project_id,
        project_name,
        facility_id,
        creator_user_id,
        industry,
        team_members_added: team_assignments.length,
        base_year_emissions_records: base_year_emissions.length,
        org_boundaries_records: org_boundaries.length,
        reporting_period: {
          start: reporting_period_start,
          end: reporting_period_end
        }
      },
      201
    );

  } catch (error) {
    console.error('Error creating project:', error);
    return this.utility.response.init(
      res,
      false,
      error.message.includes('overlapping') 
        ? error.message 
        : "Internal server error while creating project",
      {
        error: error.message.includes('overlapping') 
          ? "OVERLAPPING_PROJECT" 
          : "INTERNAL_SERVER_ERROR",
        details: error.message
      },
      error.message.includes('overlapping') ? 400 : 500
    );
  }
};



  ResolveAnomalyFlagAsIgnored = async (req, res) => {
    try {
      const { flag_id } = req.body;
      const user_id = req.user.userId; // from JWT

      const query = {
        text: 'SELECT public.resolve_anomaly_flag_as_ignored($1, $2) AS message',
        values: [flag_id, user_id]
      };

      const result = await this.utility.sql.query(query);
      const message = result.rows?.[0]?.message || 'No response from database';
      const success = message.toLowerCase().includes('ignored');

      return this.utility.response.init(res, success, message, { message });
    } catch (error) {
      console.error('Error resolving anomaly flag:', error);
      return this.utility.response.init(res, false, 'Failed to resolve anomaly flag', { error: error.message }, 500);
    }
  };



  RunAllValidationsForScope = async (req, res) => {
    try {
      const { project_id, scope_name } = req.body;

      const query = {
        text: 'SELECT run_all_validations_for_scope($1, $2) as result',
        values: [project_id, scope_name]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows || result.rows.length === 0) {
        return this.utility.response.init(res, false, "Failed to run validations", {
          error: "VALIDATION_ERROR"
        }, 400);
      }

      const statusMessage = result.rows[0].result;

      return this.utility.response.init(
        res,
        true,
        statusMessage,
        {
          project_id,
          scope: scope_name,
          timestamp: new Date().toISOString()
        }
      );

    } catch (error) {
      console.error('Error running validations:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while running validations",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  UpsertActivityDataBatch = async (req, res) => {
    try {
      const { project_id, data_batch } = req.body;
      const user_id = req.user.userId; // From JWT token

      // Validate data batch is not empty
      if (!Array.isArray(data_batch) || data_batch.length === 0) {
        return this.utility.response.init(res, false, "Data batch cannot be empty", {
          error: "INVALID_INPUT"
        }, 400);
      }

      const query = {
        text: 'SELECT upsert_activity_data_batch($1, $2, $3) as result',
        values: [project_id, user_id, JSON.stringify(data_batch)]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows || result.rows.length === 0) {
        return this.utility.response.init(res, false, "Failed to save data batch", {
          error: "SAVE_FAILED"
        }, 400);
      }

      const statusMessage = result.rows[0].result;

      return this.utility.response.init(
        res,
        true,
        statusMessage,
        {
          project_id,
          records_processed: data_batch.length,
          processed_at: new Date().toISOString()
        }
      );

    } catch (error) {
      console.error('Error saving activity data batch:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while saving data batch",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  ApplyTemplateToProject = async (req, res) => {
    try {
      const { project_id, template_id } = req.body;

      const query = {
        text: 'SELECT public.apply_template_to_project($1, $2) AS message',
        values: [project_id, template_id]
      };

      const result = await this.utility.sql.query(query);
      const message = result.rows?.[0]?.message || 'No response from database';

      const success = message.toLowerCase().includes('successfully');

      return this.utility.response.init(res, success, message, { message });
    } catch (error) {
      console.error('Error applying template:', error);
      return this.utility.response.init(res, false, 'Failed to apply template', { error: error.message }, 500);
    }
  };

  SaveProjectActivityConfiguration = async (req, res) => {
    try {
      const { project_id, configured_activities } = req.body;
      const user_id = req.user.userId; // from JWT if needed later

      const query = {
        text: 'SELECT public.save_project_activity_configuration($1, $2::jsonb) AS message',
        values: [project_id, JSON.stringify(configured_activities)]
      };

      const result = await this.utility.sql.query(query);
      const message = result.rows?.[0]?.message || 'No response from database';
      const success = message.toLowerCase().includes('successfully');

      return this.utility.response.init(res, success, message, { message });
    } catch (error) {
      console.error('Error saving project configuration:', error);
      return this.utility.response.init(res, false, 'Failed to save project configuration', { error: error.message }, 500);
    }
  };

  // search_assignable_users_for_project


  //get users based on org_id
  get_assignable_users_for_org = async (req, res) => {
    try {

      const { org_id } = req.body;

      const query = {
        // text: `SELECT * FROM get_assignable_users_for_org(  $1  )`,
        // text: `SELECT * FROM users WHERE org_id = $1 OR role_id = 16`,
        text: `SELECT 
    u.user_id,
    u.full_name,
    r.role_name
FROM users u
LEFT JOIN roles r 
    ON u.role_id = r.role_id
WHERE 
    u.org_id = $1
    OR u.role_id = 16;
`,
        values: [
          org_id,
        ]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows || result.rows.length === 0) {
        return this.utility.response.init(res, false, "No response from database", {}, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "getting Users under Organisation  successfully ",
        { facility: result.rows }
      );

    } catch (err) {
      console.error("createFacility error:", err);
      return this.utility.response.init(res, false, "Internal server error");
    }
  };


  get_user_project_request_summary = async (req, res) => {
    try {
      const { p_user_id } = req.body;
      const query = {
        text: 'SELECT * FROM get_user_project_request_summary($1)',
        values: [p_user_id]
      }
      const result = await this.utility.sql.query(query);
      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }
      const summaryData = result.rows[0];
      return this.utility.response.init(
        res,
        true,
        "User project request summary fetched successfully",
        {
          summary: summaryData
        }
      );

    } catch (error) {
      console.error('Error fetching user project request summary', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching user project request summary",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  get_project_portfolio_stats = async (req, res) => {
    try {
      const { p_user_id } = req.body;

      const query = {
        text: 'SELECT * FROM get_project_portfolio_stats($1)',
        values: [p_user_id]
      }
      const result = await this.utility.sql.query(query);
      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }
      const statsData = result.rows[0];
      return this.utility.response.init(
        res,
        true,
        "Project portfolio stats fetched successfully",
        {
          stats: statsData
        }
      );
    } catch (error) {
      console.error('Error fetching project portfolio stats', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching project portfolio stats",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  }

  get_templatesBy_parentID = async (req, res) => {
    try {

      const {
        org_id,
        industry

      } = req.body;

      const query = {
        text: `SELECT t.*
FROM templates t
JOIN organisation o
    ON t.org_id = o.org_id
WHERE o.parent_org_id = (
    SELECT parent_org_id 
    FROM organisation 
    WHERE org_id = $1   -- <-- send org_id here
)
AND t.industry = $2;     -- <-- send industry here

`,
        values: [
          org_id,
          industry
        ]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows || result.rows.length === 0) {
        return this.utility.response.init(res, false, "No response from database", {}, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "getting Users under Organisation  successfully ",
        { facility: result.rows }
      );

    } catch (err) {
      console.error("createFacility error:", err);
      return this.utility.response.init(res, false, "Internal server error");
    }
  };

}

module.exports = ProjectActivities;