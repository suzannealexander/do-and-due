"use client";

import { createEventAction } from "@/actions/events.server";
import { createEventSchema } from "@/actions/zod";
import Button from "@/components/Button";
import { ErrorPopup, ErrorText } from "@/components/Errors";
import Input from "@/components/Input";
import { DateStateData, GroupDisplayData } from "@/schemas/fe.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function AddEventForm({
  groupData,
  dateState,
  toggleAddEventState,
}: {
  groupData: GroupDisplayData;
  dateState: DateStateData;
  toggleAddEventState: CallableFunction;
}) {
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(createEventSchema) });
  
  const router = useRouter();

  // Track if cost section is enabled
  const [addCost, setAddCost] = useState(false);

  // Cost-related state
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [splitAmount, setSplitAmount] = useState<{ [key: string]: number }>({});
  const [totalCost, setTotalCost] = useState<number>(0);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);

  // Watch members to update selected members for cost sharing
  const members = watch("members", "");

  // Reset cost distribution when selected members changes
  useEffect(() => {
    if (members && members.trim()) {
      const membersList = members.trim().split(/\s+/);
      setSelectedMembers(membersList);
      
      // Reset split amounts
      const newSplitAmount: { [key: string]: number } = {};
      membersList.forEach(member => {
        newSplitAmount[member] = 0;
      });
      setSplitAmount(newSplitAmount);
      updateRemainingAmount(totalCost, newSplitAmount);
    }
  }, [members]);

  const handleTotalCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setTotalCost(value);
      updateRemainingAmount(value, splitAmount);
    } else {
      setTotalCost(0);
      setRemainingAmount(0);
    }
  };

  const handleShareChange = (username: string, amount: number) => {
    const newSplitAmount = { ...splitAmount, [username]: amount };
    setSplitAmount(newSplitAmount);
    updateRemainingAmount(totalCost, newSplitAmount);
  };

  const updateRemainingAmount = (total: number, splits: { [key: string]: number }) => {
    const totalSplit = Object.values(splits).reduce((sum, amount) => sum + amount, 0);
    setRemainingAmount(total - totalSplit);
  };

  const distributeCostEvenly = () => {
    if (selectedMembers.length === 0) return;
    
    const evenShare = totalCost / selectedMembers.length;
    const roundedShare = Math.floor(evenShare * 100) / 100; // Round to 2 decimal places
    
    const newSplitAmount: { [key: string]: number } = {};
    selectedMembers.forEach((member, index) => {
      // Last member gets any remaining amount to account for rounding errors
      if (index === selectedMembers.length - 1) {
        const sumSoFar = Object.values(newSplitAmount).reduce((sum, amount) => sum + amount, 0);
        newSplitAmount[member] = Math.round((totalCost - sumSoFar) * 100) / 100;
      } else {
        newSplitAmount[member] = roundedShare;
      }
    });
    
    setSplitAmount(newSplitAmount);
    updateRemainingAmount(totalCost, newSplitAmount);
  };

  const onSubmit = async (data: any) => {
    // Prepare the event data
    const eventData = {
      name: data.name,
      date: data.date,
      members: data.members,
      // Add cost data if the cost section is enabled
      cost: addCost && totalCost > 0 ? {
        name: data.costName || `Cost for ${data.name}`,
        category: data.costCategory,
        amount: totalCost,
        description: data.costDescription,
        payerUsername: data.payerUsername,
        shares: Object.entries(splitAmount).map(([username, amount]) => ({
          username,
          amount
        }))
      } : undefined
    };

    // Validate cost data if adding cost
    if (addCost && totalCost > 0) {
      // Check if total matches split amount
      if (Math.abs(remainingAmount) > 0.01) {
        setError("root", {
          message: "The total cost must match the sum of all shares",
        });
        return;
      }

      // Check if payer is selected
      if (!data.payerUsername) {
        setError("payerUsername", {
          message: "Please select a payer",
        });
        return;
      }
    }

    const res = await createEventAction(eventData, groupData);
    console.log("AddEventForm", res);
    if (res.ok) {
      toggleAddEventState();
      router.push("/");
    } else {
      setError("root", {
        message: res.message || "Failed to create event",
      });
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={() => toggleAddEventState()}
        className="mb-8 rounded-lg hover:bg-gray-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="rounded-lg stroke-gray-400 hover:stroke-purple-500"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full space-y-6"
      >
        {errors.root && <ErrorPopup message={errors.root.message} />}
        
        {/* Event Details Section */}
        <h3 className="text-lg font-medium">Event Details</h3>
        
        <div>
          <Input
            type="text"
            {...register("name")}
            label="Event Name"
          />
          {errors.name && <ErrorText message={errors.name.message} />}
        </div>

        <div>
          <Input
            type="text"
            {...register("date")}
            label="First Date"
            value={dateState.target.format("YYYY-MM-DD")}
            disabled
          />
          {errors.date && <ErrorText message={errors.date.message} />}
        </div>

        <div>
          <Input
            type="text"
            {...register("members")}
            label="Members (separated by spaces)"
          />
          {errors.members && (
            <ErrorText message={errors.members.message} />
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Repeats (not implemented yet)
          </label>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {["None", "Daily", "Weekly", "Monthly", "Yearly"].map(
              (option, index) => (
                <label
                  key={option}
                  className="flex-shrink-0 cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm transition-all duration-200 hover:border-purple-500 hover:shadow"
                >
                  <input
                    type="radio"
                    value={option}
                    checked={index === 0 ? true : false}
                    disabled // TODO: implement backend logic to allow repeat events
                    {...register("repeats")}
                    className="peer hidden"
                  />
                  <span className="peer-checked:font-semibold peer-checked:text-purple-600">
                    {option}
                  </span>
                </label>
              ),
            )}
          </div>
        </div>

        {/* Cost Section Toggle */}
        <div className="mt-8">
          <div className="flex items-center">
            <input
              id="addCost"
              type="checkbox"
              checked={addCost}
              onChange={() => setAddCost(!addCost)}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="addCost" className="ml-2 text-lg font-medium">
              Add Associated Cost
            </label>
          </div>
        </div>

        {/* Cost Details Section */}
        {addCost && (
          <div className="space-y-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-lg font-medium">Cost Details</h3>
            
            <div>
              <Input
                type="text"
                {...register("costName")}
                label="Cost Name (optional)"
                placeholder="Default: same as event name"
              />
            </div>

            <div>
              <Input
                type="text"
                {...register("costCategory")}
                label="Category (optional)"
              />
            </div>

            <div>
              <Input
                type="number"
                step="0.01"
                label="Total Amount"
                value={totalCost || ""}
                onChange={handleTotalCostChange}
              />
            </div>

            <div>
              <Input
                type="text"
                {...register("costDescription")}
                label="Description (optional)"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Payer
              </label>
              <select
                {...register("payerUsername")}
                className="w-full rounded-lg border border-gray-300 p-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="">Select payer</option>
                {groupData.members.map((member) => (
                  <option key={member.username} value={member.username}>
                    {member.username}
                  </option>
                ))}
              </select>
              {errors.payerUsername && <ErrorText message={errors.payerUsername.message} />}
            </div>

            {selectedMembers.length > 0 && (
              <>
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Split Between Members
                  </label>
                  <Button
                    type="button"
                    className="mt-2 w-full"
                    onClick={distributeCostEvenly}
                    disabled={selectedMembers.length === 0 || totalCost <= 0}
                  >
                    Distribute Evenly
                  </Button>
                </div>

                <div className="space-y-3 rounded-lg border border-gray-300 p-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Member</span>
                    <span>Amount ($)</span>
                  </div>
                  
                  {selectedMembers.map((username) => (
                    <div key={username} className="flex items-center justify-between">
                      <span>{username}</span>
                      <input
                        type="number"
                        step="0.01"
                        className="w-24 rounded-lg border border-gray-300 p-2 text-right focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-200"
                        value={splitAmount[username] || ""}
                        onChange={(e) => handleShareChange(username, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  ))}
                  
                  <div className={`flex items-center justify-between border-t pt-2 font-medium ${
                    Math.abs(remainingAmount) < 0.01 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    <span>Remaining:</span>
                    <span>${remainingAmount.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <Button
          className="w-full"
          type="submit"
          disabled={isSubmitting || (addCost && totalCost > 0 && Math.abs(remainingAmount) > 0.01)}
        >
          Create Event
        </Button>
      </form>
    </div>
  );
}
