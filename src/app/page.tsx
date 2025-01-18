"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { fetchPolls } from "./actions/fetchpolls";

export type Poll = {
  id: string;
  created_at: string;
  question: string;
  created_by: string | null;
  options: Option[];
  hasVoted: boolean;
  selectedOptionIndex: string | null;
};

export type Option = {
  id: string;
  poll_id: string;
  text: string;
};

type VoteCount = {
  option_id: string;
  count: number;
};

export default function Home() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [voteCounts, setVoteCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const loadPollData = async () => {
      setIsLoading(true);
      try {
        const fetchedPolls = await fetchPolls();
        if (fetchedPolls) {
          setPolls(fetchedPolls);

          // Fetch vote counts for all polls
          const allVoteCounts: { [key: string]: number } = {};
          for (const poll of fetchedPolls) {
            const pollVotes = await fetchVoteCounts(poll.id);
            if (pollVotes) {
              pollVotes.forEach((vote: VoteCount) => {
                allVoteCounts[vote.option_id] = vote.count;
              });
            }
          }
          setVoteCounts(allVoteCounts);
        }
      } catch (error) {
        console.error("Error loading poll data:", error);
        setError("Failed to load polls");
      } finally {
        setIsLoading(false);
      }
    };

    loadPollData();
  }, []);

  useEffect(() => {
    console.log("Setting up auth listener...");
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(
        "Initial session check:",
        session?.user ? "User logged in" : "No user"
      );
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("votes")
      .on(
        "postgres_changes" as const,
        { event: "*", schema: "public", table: "votes" }, // Listen to all vote changes
        async (payload) => {
          // Refresh vote counts for the affected poll
          const pollId =
            (payload.new as any)?.poll_id || (payload.old as any)?.poll_id;
          if (pollId) {
            const newVoteCounts = await fetchVoteCounts(pollId);
            if (newVoteCounts) {
              setVoteCounts((current) => ({
                ...current,
                ...Object.fromEntries(
                  newVoteCounts.map((vote: VoteCount) => [
                    vote.option_id,
                    vote.count,
                  ])
                ),
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .insert({
          question: question,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (pollError) throw pollError;

      const optionsToInsert = options
        .filter((option) => option.trim() !== "")
        .map((option) => ({
          poll_id: pollData.id,
          text: option,
        }));

      const { data: optionsData, error: optionsError } = await supabase
        .from("options")
        .insert(optionsToInsert)
        .select();

      if (optionsError) throw optionsError;

      // Add the new poll to the local state
      const newPoll: Poll = {
        ...pollData,
        options: optionsData,
        hasVoted: false,
        selectedOptionIndex: null,
      };
      setPolls((current) => [...current, newPoll]);

      // Reset form
      setQuestion("");
      setOptions(["", ""]);
      setError("");
      setOpen(false);
    } catch (error) {
      console.log("Error creating poll:", error);
      setError("Failed to create poll");
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      const { error } = await supabase.from("votes").insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: user?.id || null,
      });

      if (error) {
        if (error.code === "23505") {
          setError("You have already voted a sahbi");
        } else {
          setError("Failed to cast vote");
        }
        return;
      }

      // Immediately fetch new vote counts for this poll
      const newVoteCounts = await fetchVoteCounts(pollId);
      if (newVoteCounts) {
        setVoteCounts((current) => ({
          ...current,
          ...Object.fromEntries(
            newVoteCounts.map((vote: VoteCount) => [vote.option_id, vote.count])
          ),
        }));
      }

      const updatedPolls = polls.map((poll) =>
        poll.id === pollId
          ? { ...poll, hasVoted: true, selectedOptionIndex: optionId }
          : poll
      );
      setPolls(updatedPolls);
    } catch (error) {
      console.error("Error casting vote:", error);
      setError("Failed to cast vote");
    }
  };

  const fetchVoteCounts = async (pollId: string) => {
    type VoteCountRow = {
      option_id: string;
      vote_count: number;
    };

    const { data, error } = await supabase
      .from("vote_counts")
      .select("option_id, vote_count")
      .eq("poll_id", pollId);

    if (error) {
      console.error("Error fetching vote counts:", error);
      return null;
    }

    return (data as VoteCountRow[]).map((row) => ({
      option_id: row.option_id,
      count: row.vote_count,
    }));
  };

  const calculatePercentage = (optionId: string, pollId: string) => {
    const totalVotes = polls
      .find((p) => p.id === pollId)
      ?.options.reduce((acc, opt) => acc + (voteCounts[opt.id] || 0), 0);

    if (!totalVotes) return 0;
    return Math.round(((voteCounts[optionId] || 0) / totalVotes) * 100);
  };

  const handleRemoveOptions = (indexToRemove: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, index) => index !== indexToRemove));
    }
  };
  const handleRemovePolls = async (pollId: string) => {
    try {
      // First, delete related votes
      const { error: votesError } = await supabase
        .from("votes")
        .delete()
        .eq("poll_id", pollId);

      if (votesError) {
        console.error("Error deleting votes:", votesError);
        setError("Failed to delete poll votes");
        return;
      }

      // Then, delete related options
      const { error: optionsError } = await supabase
        .from("options")
        .delete()
        .eq("poll_id", pollId);

      if (optionsError) {
        console.error("Error deleting options:", optionsError);
        setError("Failed to delete poll options");
        return;
      }

      // Finally, delete the poll itself
      const { error: pollError } = await supabase
        .from("polls")
        .delete()
        .eq("id", pollId);

      if (pollError) {
        console.error("Error deleting poll:", pollError);
        setError("Failed to delete poll");
        return;
      }

      // Update local state only after successful database deletion
      setPolls((currentPolls) =>
        currentPolls.filter((poll) => poll.id !== pollId)
      );
      setError(""); // Clear any existing errors
    } catch (error) {
      console.error("Error in handleRemovePolls:", error);
      setError("Failed to delete poll");
    }
  };

  const isFormValid = () => {
    const nonEmptyOptions = options.filter((opt) => opt.trim() !== "");
    return question.trim() !== "" && nonEmptyOptions.length >= 2;
  };

  return (
    <div className="min-h-screen p-8 sm:p-20">
      <main>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Click to add poll</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add your poll details</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="mt-2">
                <p>What&apos;s your question?</p>
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question"
                />
              </div>

              {options.map((option, index) => (
                <div
                  key={index}
                  className="mt-2 flex justify-center items-center gap-2"
                >
                  <p className="mr-2 w-[80px]">option {index + 1}</p>
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[index] = e.target.value;
                      setOptions(newOptions);
                    }}
                  />

                  {index >= 2 && (
                    <Button
                      variant="destructive"
                      onClick={() => handleRemoveOptions(index)}
                    >
                      {" "}
                      X{" "}
                    </Button>
                  )}
                </div>
              ))}

              <Button type="button" onClick={handleAddOption} className="mt-2">
                add option
              </Button>
              <Button
                type="submit"
                className="mt-2 ml-2"
                disabled={!isFormValid()}
              >
                Create Poll
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <div className="mt-8  ">
          {isLoading && <p>Loading polls...</p>}
          {polls.map((poll, pollIndex) => (
            <div className="flex gap-2 items-center" key={pollIndex}>
              <div className="mb-6 p-4 border rounded-lg w-[400px]">
                <h3 className="text-lg font-semibold mb-2">{poll.question}</h3>
                <div className="space-y-2">
                  {poll.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="pl-4 flex items-center gap-2"
                    >
                      <Checkbox
                        onClick={() => handleVote(poll.id, option.id)}
                        id={`option-${pollIndex}-${optionIndex}`}
                        disabled={poll.hasVoted}
                        checked={poll.selectedOptionIndex === option.id}
                      />
                      <label
                        htmlFor={`option-${pollIndex}-${optionIndex}`}
                        className="flex justify-between w-full"
                      >
                        <span>{option.text}</span>
                        <div className="flex gap-2">
                          <span>{voteCounts[option.id] || 0} votes</span>
                          <span className="text-gray-500">
                            ({calculatePercentage(option.id, poll.id)}%)
                          </span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <Button
                variant="destructive"
                onClick={() => handleRemovePolls(poll.id)}
              >
                X
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
