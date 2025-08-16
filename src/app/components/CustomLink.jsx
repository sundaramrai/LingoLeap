"use client";
import Link from "next/link";
import PropTypes from "prop-types";

const CustomLink = ({ title, path, icon }) => {
  return (
    <Link href={`/${path}`}>
      <div className="flex justify-items-center items-center border border-black-500 mb-4 p-2 rounded-md gap-x-3">
        <div>{icon}</div>
        <div>{title}</div>
      </div>
    </Link>
  );
};

CustomLink.propTypes = {
  title: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  icon: PropTypes.node
};

export default CustomLink;