import React from "react";

const Btn = ({ loading, children, className }) => {
  return (
    <button className={`px-4 py-2 bg-black cursor-pointer text-white w-full rounded-md mt-4 font-semibold text-base hover:opacity-80 ${className}`}>
      {loading && (
        <div className="flex items-center gap-3 justify-center">
          <Loader2 className="animate-spin " size={15} />
          Loading ...
        </div>
      )}
      {children}
    </button>
  );
};

export default Btn;
