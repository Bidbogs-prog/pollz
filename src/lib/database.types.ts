export interface Database {
  public: {
    Tables: {
      polls: {
        Row: {
          id: string;
          created_at: string;
          question: string;
          created_by: string | null;
        };

        Insert: {
          id?: string;
          create_at?: string;
          question: string;
          created_by?: string | null;
        };

        Update: {
          id?: string;
          create_at?: string;
          question: string;
          created_by?: string | null;
        };
      };
    };
  };
}
