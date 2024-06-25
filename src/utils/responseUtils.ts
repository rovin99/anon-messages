export function createSuccessResponse(message: any, data = {}) {
    return  Response.json(
      ({
        success: true,
        message,
        data,
      }),
      { status: 200 }
    );
  }
  
  export function createErrorResponse(message: any, status=500 ) {
    return  Response.json(
      ({
        success: false,
        message,
      }),
      { status }
    );
  }