import { Loader2 } from "lucide-react";
import React from "react";

const Btn = ({ loading, children, className,onClick }) => {
  return (
    <button onClick={onClick} className={`px-4 py-2 bg-black cursor-pointer text-white  rounded-md mt-4 font-semibold text-base hover:opacity-80 ${className}`}>
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
