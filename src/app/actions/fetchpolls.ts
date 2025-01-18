// app/actions/fetchPolls.ts
import { supabase } from "@/lib/supabase";
import { Poll } from "../page";

export async function fetchPolls(): Promise<Poll[] | null> {
  try {
    const { data: polls, error: pollError } = await supabase.from("polls")
      .select(`
        id,
        created_at,
        question,
        created_by,
        options (
          id,
          poll_id,
          text
        )
      `);

    if (pollError) {
      console.error("Error fetching polls:", pollError);
      return null;
    }

    // Transform the data to match Poll type
    const transformedPolls: Poll[] = polls.map((poll) => ({
      id: poll.id,
      created_at: poll.created_at,
      question: poll.question,
      created_by: poll.created_by,
      options: poll.options || [],
      hasVoted: false, // Default value
      selectedOptionIndex: null, // Default value
    }));
    return transformedPolls;
  } catch (error) {
    console.error("Error in fetchPolls:", error);
    return null;
  }
}
