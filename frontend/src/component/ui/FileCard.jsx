import React from "react";
import { Card } from "antd";
const { Meta } = Card;

const FileCard = ({ file }) => {
  const rawCreatedAt = file.timestamp;
  const createdAt = rawCreatedAt.split("T")[0];
  const rawFileType = file.mimeType;
  const fileType = rawFileType.split("/")[1];

  return (
    <Card
      hoverable
      style={{
        width: 240,
      }}
      cover={<img alt="logo" className="h-[8rem] aspect-square px-10 py-3 pt-5" src={`/${fileType}.png`} />}
    >
      <Meta title={file.filename} description={`Created at: ${createdAt}`} />
    </Card>
  );
};

export default FileCard;
