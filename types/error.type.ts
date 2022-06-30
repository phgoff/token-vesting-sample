export type MetmaskErrorType = {
  reason: string;
  code: string;
  method: string;
  transaction: {
    from: string;
    to: string;
    data: string;
    accessList: any;
  };
  error: {
    code: number;
    message: string;
    data: {
      code: number;
      message: string;
      data: string;
    };
    stack: string;
  };
};
