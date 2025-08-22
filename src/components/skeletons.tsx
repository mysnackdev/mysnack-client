"use client";
import React from "react";

export function SkeletonLine({w="100%"}:{w?:string}){
  return <div className="animate-pulse h-4 rounded bg-gray-200" style={{width:w}} />;
}
export function SkeletonCard(){
  return (
    <div className="card-lg space-y-3 animate-pulse">
      <div className="h-5 w-40 bg-gray-200 rounded" />
      <div className="h-4 w-2/3 bg-gray-200 rounded" />
      <div className="h-4 w-1/2 bg-gray-200 rounded" />
    </div>
  );
}
export function SkeletonList({count=5}:{count?:number}){
  return (
    <div className="card-lg space-y-2">
      {Array.from({length:count}).map((_,i)=>(
        <div key={i} className="h-12 bg-gray-200 rounded" />
      ))}
    </div>
  );
}