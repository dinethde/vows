"use client";

import { Field, cn } from "@vows/ui";
import { Controller } from "react-hook-form";

import { createContext, useContext, useId, useState } from "react";
import type { ReactElement } from "react";

import { DatePicker } from "@/components/shared/date/date-picker";

import type { AlbumFieldName } from "./album-form.schema";
import { ADDRESS_PREFIX, HELP, SLUG_WARNING, TEXT_FIELDS } from "./details-copy";
import type { TextFieldSpec } from "./details-copy";
import type { HelpedProps, TextFieldProps } from "./details-form.types";
import { useEditor } from "./editor-context";

interface FieldHelp {
  error: string | undefined;
  /** The helper line, shown only while the field has the focus and is not wrong. */
  help: string | null;
  helpId: string;
  describedBy: string | undefined;
  onFocus: () => void;
}

interface ActiveField {
  active: AlbumFieldName | null;
  setActive: (name: AlbumFieldName) => void;
}

const ActiveFieldContext = createContext<ActiveField>({ active: null, setActive: () => undefined });

/**
 * One field is active at a time, and the active field says what it is for. An
 * error takes the helper's place: one message under a field. The helper stays
 * until another field is entered rather than going on blur: if it went the
 * moment the field was left, the form would move up under the pointer, and a
 * press on Publish would land on nothing.
 */
function useFieldHelp(name: AlbumFieldName, text: string): FieldHelp {
  const { fieldError } = useEditor();
  const { active, setActive } = useContext(ActiveFieldContext);
  const helpId = useId();
  const error = fieldError(name);
  const help = active === name && !error ? text : null;
  return {
    error,
    help,
    helpId,
    describedBy: help ? helpId : undefined,
    onFocus: () => {
      setActive(name);
    },
  };
}

/* `field — studio` has nowhere to put a helper line, so it sits under the
 * component, 7 below it as the error line is, and the field is described by it. */
function Helped({ help, helpId, children, className }: HelpedProps): ReactElement {
  return (
    <div className={cn("flex flex-col gap-[7px]", className)}>
      {children}
      {help ? (
        <p id={helpId} className="type-studio-caption text-placeholder">
          {help}
        </p>
      ) : null}
    </div>
  );
}

function TextField({ spec }: TextFieldProps): ReactElement {
  const { form } = useEditor();
  const state = useFieldHelp(spec.name, spec.help);
  const registered = form.register(spec.name);
  return (
    <Helped help={state.help} helpId={state.helpId}>
      <Field
        surface="studio"
        label={spec.label}
        placeholder={spec.placeholder}
        autoComplete="off"
        aria-describedby={state.describedBy}
        {...(state.error ? { error: state.error } : {})}
        {...registered}
        onFocus={state.onFocus}
      />
    </Helped>
  );
}

function DateField(): ReactElement {
  const { form } = useEditor();
  const state = useFieldHelp("shotOn", HELP.shotOn);
  return (
    <Helped help={state.help} helpId={state.helpId}>
      <Controller
        control={form.control}
        name="shotOn"
        render={({ field }) => (
          <DatePicker
            label="Wedding date"
            placeholder="day month year"
            name={field.name}
            value={field.value}
            inputRef={field.ref}
            onChange={field.onChange}
            onFocus={state.onFocus}
            onBlur={field.onBlur}
            {...(state.describedBy ? { describedBy: state.describedBy } : {})}
            {...(state.error ? { error: state.error } : {})}
          />
        )}
      />
    </Helped>
  );
}

function SlugField(): ReactElement {
  const { form, album } = useEditor();
  const moved = form.formState.dirtyFields.slug === true && album.stage === "published";
  const state = useFieldHelp("slug", moved ? SLUG_WARNING : HELP.slug);
  const registered = form.register("slug");
  return (
    <Helped help={state.help} helpId={state.helpId}>
      <Field
        surface="studio"
        label="Page address"
        prefix={ADDRESS_PREFIX}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        aria-describedby={state.describedBy}
        {...(state.error ? { error: state.error } : {})}
        {...registered}
        onFocus={state.onFocus}
      />
    </Helped>
  );
}

function StoryField(): ReactElement {
  const { form } = useEditor();
  const state = useFieldHelp("story", HELP.story);
  const registered = form.register("story");
  return (
    <Helped
      help={state.help}
      helpId={state.helpId}
      className="tablet:col-span-2 desktop:col-span-1"
    >
      <Field
        surface="studio"
        multiline
        label="Story"
        placeholder="a short story that reflects the wedding"
        aria-describedby={state.describedBy}
        {...(state.error ? { error: state.error } : {})}
        {...registered}
        onFocus={state.onFocus}
      />
    </Helped>
  );
}

const [NAMES, ...DETAILS] = TEXT_FIELDS;

/**
 * The album details. One column on a desktop and on a phone, two on a tablet.
 * The order here is the order on screen at every width, so the Tab key never
 * jumps. A field is checked when the person leaves it, and its error clears
 * the moment it is right.
 */
export function DetailsForm(): ReactElement {
  const [active, setActive] = useState<AlbumFieldName | null>(null);
  return (
    <ActiveFieldContext.Provider value={{ active, setActive }}>
      <div className="gap-space-4 tablet:grid-cols-2 desktop:grid-cols-1 grid grid-cols-1">
        <TextField spec={NAMES} />
        <DateField />
        {DETAILS.map((spec: TextFieldSpec) => (
          <TextField key={spec.name} spec={spec} />
        ))}
        <SlugField />
        <StoryField />
      </div>
    </ActiveFieldContext.Provider>
  );
}
