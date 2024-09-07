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
      cover={<img alt="logo" className="h-[10rem] aspect-square px-6 py-3" src={`/${fileType}.png`} />}
    >
      <Meta title={file.filename} description={`Created at: ${createdAt}`} />
    </Card>
  );
};

export default FileCard;
