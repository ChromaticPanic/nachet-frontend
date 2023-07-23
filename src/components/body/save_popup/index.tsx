import React from "react";
import {
  Overlay,
  ButtonWrap,
  Select,
  Option,
  LabelInput,
  InfoContainer,
} from "./indexElements";
import { Box, CardHeader, IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { colours } from "../../../styles/colours";

interface params {
  setSaveOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  saveImage?: () => void;
  imageFormat?: string;
  imageLabel?: string;
  handleFormat?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleLabel?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SavePopup: React.FC<params> = (props): JSX.Element => {
  const handleClose = (): void => {
    if (props.setSaveOpen === undefined) {
      return;
    }
    props.setSaveOpen(false);
  };

  return (
    <Overlay>
      <Box
        sx={{
          width: 400,
          height: 300,
          zIndex: 30,
          border: 1,
          borderRadius: 1,
          background: colours.CFIA_Background_White,
        }}
      >
        <CardHeader
          title="Tools"
          titleTypographyProps={{
            variant: "h6",
            align: "left",
            fontWeight: 600,
            fontSize: "18px",
            color: colours.CFIA_Font_Black,
            zIndex: 30,
          }}
          action={
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          }
          sx={{
            paddingBottom: 0,
          }}
        />
        <InfoContainer>
          <LabelInput
            placeholder="Capture label"
            onChange={props.handleLabel}
            value={props.imageLabel}
          />
          <Select value={props.imageFormat} onChange={props.handleFormat}>
            <Option value="image/png">Capture Format: PNG</Option>
            <Option value="image/jpeg">Capture Format: JPEG</Option>
          </Select>
        </InfoContainer>
        <ButtonWrap>
          <Button
            variant="outlined"
            size="large"
            sx={{
              alignContent: "center",
              alignItems: "center",
              paddingLeft: 4,
              paddingRight: 4,
              fontSize: "0.9rem",
              color: colours.CFIA_Font_Black,
              borderColor: colours.CFIA_Font_Black,
            }}
            onClick={props.saveImage}
          >
            SAVE
          </Button>
        </ButtonWrap>
      </Box>
    </Overlay>
  );
};

export default SavePopup;
