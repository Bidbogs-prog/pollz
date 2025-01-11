"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Poll = {
  question: string;
  options: string[];
};

export default function Home() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>("");

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPoll: Poll = {
      question,
      options: options.filter((option) => option.trim() !== ""),
    };
    setPolls([...polls, newPoll]);
    console.log(polls);

    setQuestion("");
    setOptions(["", ""]);
    setError("");
    setOpen(false);
  };

  const handleRemoveOptions = (indexToRemove: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, index) => index !== indexToRemove));
    }
  };
  const handleRemovePolls = (indexToRemove: number) => {
    setPolls(polls.filter((_, index) => index !== indexToRemove));
  };
  const isFormValid = () => {
    const nonEmptyOptions = options.filter((opt) => opt.trim() !== "");
    return question.trim() !== "" && nonEmptyOptions.length >= 2;
  };

  return (
    <div className="min-h-screen p-8 sm:p-20">
      <main>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button>Click to add poll</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add your poll details</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="mt-2">
                <p>What's your question?</p>
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question"
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

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
          {polls.map((poll, index) => (
            <div className="flex gap-2 items-center">
              <div key={index} className="mb-6 p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{poll.question}</h3>
                <div className="space-y-2">
                  {poll.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="pl-4">
                      • {option}
                    </div>
                  ))}
                </div>
              </div>
              <Button
                className=""
                variant="destructive"
                onClick={() => handleRemovePolls(index)}
              >
                {" "}
                X{" "}
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
