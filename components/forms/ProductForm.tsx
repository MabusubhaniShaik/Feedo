// components/forms/ProductForm.tsx - OPTIMIZED
"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Plus,
  Trash2,
  DollarSign,
  Hash,
  User,
  MessageSquare,
  Star,
  AlertCircle,
  Info,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";

interface ProductFormProps {
  mode: "view" | "create" | "edit";
  initialData?: any;
  loading?: boolean;
  productOwners?: Array<{ _id: string; name: string }>;
}

export interface ProductFormRef {
  getFormData: () => any;
  validate: () => boolean;
}

interface Question {
  question_text: string;
  max_rating: number;
  info: string;
  is_active?: boolean;
}

export const ProductForm = forwardRef<ProductFormRef, ProductFormProps>(
  (
    {
      mode,
      initialData,
      loading = false,
      productOwners = [],
    }: ProductFormProps,
    ref
  ) => {
    const [formData, setFormData] = useState({
      product_code: "",
      name: "",
      description: "",
      price: 0,
      category: [] as string[],
      product_owner_id: "",
      product_owner_name: "",
      questions: [] as Question[],
      total_reviews: 0,
      average_rating: 0,
      is_active: true,
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
      newCategory: "",
      newQuestion: {
        question_text: "",
        max_rating: 5,
        info: "",
        is_active: true,
      },
    });

    const [maxQuestionsReached, setMaxQuestionsReached] = useState(false);

    useImperativeHandle(ref, () => ({
      getFormData: () => {
        const { newCategory, newQuestion, ...submitData } = formData;
        return {
          ...submitData,
          product_code: submitData.product_code.toUpperCase(),
          price: Number(submitData.price) || 0,
          questions: submitData.questions.map((q) => ({
            question_text: q.question_text.trim(),
            max_rating: Number(q.max_rating) || 5,
            info: q.info.trim(),
            is_active: q.is_active !== false,
          })),
        };
      },
      validate: () => {
        const requiredFields = [
          formData.product_code.trim(),
          formData.name.trim(),
          formData.product_owner_id,
          formData.product_owner_name,
          formData.category.length > 0,
          formData.questions.length > 0,
        ];

        const questionsValid = formData.questions.every(
          (q) => q.question_text.trim() && q.info.trim()
        );

        return (
          requiredFields.every(Boolean) && questionsValid && formData.price >= 0
        );
      },
    }));

    useEffect(() => {
      if (initialData) {
        setFormData({
          product_code: initialData.product_code || "",
          name: initialData.name || "",
          description: initialData.description || "",
          price: initialData.price || 0,
          category: initialData.category || [],
          product_owner_id: initialData.product_owner_id || "",
          product_owner_name: initialData.product_owner_name || "",
          questions:
            initialData.questions?.map((q: any) => ({
              question_text: q.question_text || "",
              max_rating: q.max_rating || 5,
              info: q.info || "",
              is_active: q.is_active !== false,
            })) || [],
          total_reviews: initialData.total_reviews || 0,
          average_rating: initialData.average_rating || 0,
          is_active: initialData.is_active ?? true,
          created_by: initialData.created_by || "SYSTEM",
          updated_by: initialData.updated_by || "SYSTEM",
          newCategory: "",
          newQuestion: {
            question_text: "",
            max_rating: 5,
            info: "",
            is_active: true,
          },
        });
      }
    }, [initialData]);

    useEffect(() => {
      setMaxQuestionsReached(formData.questions.length >= 5);
    }, [formData.questions.length]);

    useEffect(() => {
      if (formData.product_owner_id && productOwners.length > 0) {
        const owner = productOwners.find(
          (o: any) => o._id === formData.product_owner_id
        );
        if (owner) {
          setFormData((prev) => ({
            ...prev,
            product_owner_name: owner.name,
          }));
        }
      }
    }, [formData.product_owner_id, productOwners]);

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: name === "price" ? parseFloat(value) || 0 : value,
      }));
    };

    const handleSelectChange = (value: string) => {
      setFormData((prev) => ({
        ...prev,
        product_owner_id: value,
      }));
    };

    const handleSwitchChange = (checked: boolean) => {
      setFormData((prev) => ({
        ...prev,
        is_active: checked,
      }));
    };

    const handleAddCategory = useCallback(() => {
      if (formData.newCategory.trim()) {
        setFormData((prev) => ({
          ...prev,
          category: [...prev.category, prev.newCategory.trim()],
          newCategory: "",
        }));
      }
    }, [formData.newCategory]);

    const handleRemoveCategory = useCallback((index: number) => {
      setFormData((prev) => ({
        ...prev,
        category: prev.category.filter((_, i) => i !== index),
      }));
    }, []);

    const handleAddQuestion = useCallback(() => {
      if (
        formData.newQuestion.question_text.trim() &&
        formData.newQuestion.info.trim() &&
        formData.questions.length < 5
      ) {
        setFormData((prev) => ({
          ...prev,
          questions: [
            ...prev.questions,
            {
              question_text: prev.newQuestion.question_text,
              max_rating: Number(prev.newQuestion.max_rating) || 5,
              info: prev.newQuestion.info,
              is_active: prev.newQuestion.is_active,
            },
          ],
          newQuestion: {
            question_text: "",
            max_rating: 5,
            info: "",
            is_active: true,
          },
        }));
      }
    }, [formData.newQuestion, formData.questions.length]);

    const handleUpdateQuestion = useCallback(
      (index: number, field: keyof Question, value: any) => {
        setFormData((prev) => ({
          ...prev,
          questions: prev.questions.map((q, i) =>
            i === index ? { ...q, [field]: value } : q
          ),
        }));
      },
      []
    );

    const handleRemoveQuestion = useCallback((index: number) => {
      setFormData((prev) => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
      }));
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
      if (e.key === "Enter") {
        e.preventDefault();
        action();
      }
    };

    const isViewMode = mode === "view";
    const isDisabled = isViewMode || loading;

    return (
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-3 text-xs">
          {/* Basic Information */}
          <Card className="border p-2 gap-0">
            <CardHeader className="p-1 pb-1">
              <CardTitle className="text-sm font-medium">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Product Code
                  </Label>
                  {isViewMode ? (
                    <div className="text-xs p-2 border rounded bg-muted min-h-[2rem] flex items-center">
                      {formData.product_code || "-"}
                    </div>
                  ) : (
                    <Input
                      name="product_code"
                      value={formData.product_code}
                      onChange={handleInputChange}
                      disabled={mode === "edit"} // Only disabled in edit mode, enabled in create mode
                      className="text-xs h-8"
                      placeholder="SKN-VITC-001"
                      required
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Product Name</Label>
                  {isViewMode ? (
                    <div className="text-xs p-2 border rounded bg-muted min-h-[2rem] flex items-center">
                      {formData.name || "-"}
                    </div>
                  ) : (
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isDisabled}
                      className="text-xs h-8"
                      placeholder="Vitamin C Serum"
                      required
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                {isViewMode ? (
                  <div className="text-xs p-2 border rounded bg-muted min-h-[3.5rem]">
                    {formData.description || "-"}
                  </div>
                ) : (
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                    className="text-xs min-h-[3.5rem]"
                    placeholder="Product description..."
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Price ($)
                  </Label>
                  {isViewMode ? (
                    <div className="text-xs p-2 border rounded bg-muted min-h-[2rem] flex items-center">
                      ${formData.price?.toFixed(2) || "0.00"}
                    </div>
                  ) : (
                    <Input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      disabled={isDisabled}
                      className="text-xs h-8"
                      placeholder="39.99"
                      min="0"
                      step="0.01"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  {isViewMode ? (
                    <div className="text-xs p-2 border rounded bg-muted min-h-[2rem] flex items-center">
                      {formData.is_active ? "Active" : "Inactive"}
                    </div>
                  ) : (
                    <div className="flex items-center h-8">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={handleSwitchChange}
                        disabled={isDisabled}
                        className="scale-75"
                      />
                      <Label className="text-xs ml-2">
                        {formData.is_active ? "Active" : "Inactive"}
                      </Label>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Owner */}
          <Card className="border p-2 gap-0">
            <CardHeader className="p-1 pb-1">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <User className="h-3 w-3" />
                Product Owner
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Owner ID</Label>
                  {isViewMode ? (
                    <div className="text-xs p-1 border rounded bg-muted min-h-[1.75rem] flex items-center">
                      {formData.product_owner_id || "-"}
                    </div>
                  ) : productOwners.length > 0 ? (
                    <Select
                      value={formData.product_owner_id}
                      onValueChange={handleSelectChange}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="text-xs h-7">
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {productOwners.map((owner: any) => (
                          <SelectItem
                            key={owner._id}
                            value={owner._id}
                            className="text-xs"
                          >
                            {owner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      name="product_owner_id"
                      value={formData.product_owner_id}
                      onChange={handleInputChange}
                      disabled={isDisabled}
                      className="text-xs h-7"
                      placeholder="694929f5c1bf47b0260d8380"
                      required
                    />
                  )}
                </div>

                <div>
                  <Label className="text-xs">Owner Name</Label>
                  {isViewMode ? (
                    <div className="text-xs p-1 border rounded bg-muted min-h-[1.75rem] flex items-center">
                      {formData.product_owner_name || "-"}
                    </div>
                  ) : (
                    <Input
                      name="product_owner_name"
                      value={formData.product_owner_name}
                      onChange={handleInputChange}
                      disabled={isDisabled}
                      className="text-xs h-7"
                      placeholder="Annetta Padberg"
                      required
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="border p-2 gap-0">
            <CardHeader className="p-1 pb-1">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
              <div className="flex flex-wrap gap-1 min-h-[1.5rem]">
                {formData.category.length > 0 ? (
                  formData.category.map((cat, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-[0.625rem] h-5"
                    >
                      {cat}
                      {!isDisabled && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    No categories
                  </span>
                )}
              </div>

              {!isDisabled && (
                <div className="flex gap-1">
                  <Input
                    value={formData.newCategory}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newCategory: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => handleKeyDown(e, handleAddCategory)}
                    className="text-xs h-7"
                    placeholder="Add category"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCategory}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={!formData.newCategory.trim()}
                  >
                    <Plus className="h-2.5 w-2.5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Questions */}
          <Card className="border p-2 gap-0">
            <CardHeader className="p-1 pb-1">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Review Questions
                  <Badge variant="outline" className="text-[0.625rem] ml-1">
                    {formData.questions.length}/5
                  </Badge>
                </CardTitle>
                {maxQuestionsReached && !isViewMode && (
                  <Alert className="p-1 border-orange-200 bg-orange-50">
                    <AlertCircle className="h-2.5 w-2.5 text-orange-600" />
                    <span className="text-[0.625rem] text-orange-600 ml-1">
                      Max 5 questions
                    </span>
                  </Alert>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
              {formData.questions.length > 0 ? (
                formData.questions.map((q, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-2 space-y-1">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium">
                              Q{index + 1}:
                            </span>
                            {isViewMode ? (
                              <span className="text-xs">{q.question_text}</span>
                            ) : (
                              <Input
                                value={q.question_text}
                                onChange={(e) =>
                                  handleUpdateQuestion(
                                    index,
                                    "question_text",
                                    e.target.value
                                  )
                                }
                                className="text-xs h-6 border-0 p-0 focus-visible:ring-0"
                                placeholder="Question"
                              />
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-1 mt-1">
                            <div>
                              <Label className="text-[0.625rem]">
                                Max Rating (1-10)
                              </Label>
                              {isViewMode ? (
                                <div className="text-xs flex items-center gap-1">
                                  <Star className="h-2.5 w-2.5 fill-yellow-400" />
                                  {q.max_rating}
                                </div>
                              ) : (
                                <Input
                                  type="number"
                                  value={q.max_rating}
                                  onChange={(e) =>
                                    handleUpdateQuestion(
                                      index,
                                      "max_rating",
                                      e.target.value
                                    )
                                  }
                                  className="text-xs h-6"
                                  min="1"
                                  max="10"
                                />
                              )}
                            </div>

                            <div>
                              <Label className="text-[0.625rem]">Status</Label>
                              {isViewMode ? (
                                <div className="text-xs">
                                  {q.is_active ? "Active" : "Inactive"}
                                </div>
                              ) : (
                                <div className="flex items-center h-6">
                                  <Switch
                                    checked={q.is_active}
                                    onCheckedChange={(checked) =>
                                      handleUpdateQuestion(
                                        index,
                                        "is_active",
                                        checked
                                      )
                                    }
                                    className="scale-75"
                                  />
                                  <Label className="text-xs ml-1">
                                    {q.is_active ? "Active" : "Inactive"}
                                  </Label>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-1">
                            <Label className="text-[0.625rem] flex items-center gap-1">
                              <Info className="h-2.5 w-2.5" />
                              Information (Required)
                            </Label>
                            {isViewMode ? (
                              <div className="text-xs text-muted-foreground">
                                {q.info || "-"}
                              </div>
                            ) : (
                              <Input
                                value={q.info}
                                onChange={(e) =>
                                  handleUpdateQuestion(
                                    index,
                                    "info",
                                    e.target.value
                                  )
                                }
                                className="text-xs h-6"
                                placeholder="Required information"
                              />
                            )}
                          </div>
                        </div>

                        {!isDisabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveQuestion(index)}
                            className="h-6 w-6 p-0 ml-1"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-2">
                  <MessageSquare className="h-6 w-6 mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mt-1">
                    No questions added
                  </p>
                </div>
              )}

              {!isDisabled && !maxQuestionsReached && (
                <Card className="border-dashed p-1 gap-0">
                  <CardContent className="p-2 space-y-1">
                    <div>
                      <Label className="text-xs">New Question</Label>
                      <Input
                        value={formData.newQuestion.question_text}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            newQuestion: {
                              ...prev.newQuestion,
                              question_text: e.target.value,
                            },
                          }))
                        }
                        onKeyDown={(e) => handleKeyDown(e, handleAddQuestion)}
                        className="text-xs h-7"
                        placeholder="Enter question"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <Label className="text-[0.625rem]">Max Rating</Label>
                        <Input
                          type="number"
                          value={formData.newQuestion.max_rating}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              newQuestion: {
                                ...prev.newQuestion,
                                max_rating: Number(e.target.value),
                              },
                            }))
                          }
                          className="text-xs h-6"
                          min="1"
                          max="10"
                        />
                      </div>

                      <div>
                        <Label className="text-[0.625rem]">Information</Label>
                        <Input
                          value={formData.newQuestion.info}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              newQuestion: {
                                ...prev.newQuestion,
                                info: e.target.value,
                              },
                            }))
                          }
                          className="text-xs h-6"
                          placeholder="Required"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleAddQuestion}
                      size="sm"
                      className="w-full h-7 text-xs"
                      disabled={
                        !formData.newQuestion.question_text.trim() ||
                        !formData.newQuestion.info.trim()
                      }
                    >
                      <Plus className="h-2.5 w-2.5 mr-1" />
                      Add Question ({formData.questions.length}/5)
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Analytics */}
          {isViewMode && (
            <Card className="border p-2 gap-0">
              <CardHeader className="p-1 pb-1">
                <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Total Reviews</Label>
                    <div className="text-xs p-1 border rounded bg-muted min-h-[1.75rem] flex items-center justify-center font-medium">
                      {formData.total_reviews || 0}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Average Rating</Label>
                    <div className="text-xs p-1 border rounded bg-muted min-h-[1.75rem] flex items-center justify-center font-medium">
                      {formData.average_rating?.toFixed(2) || "0.00"}
                      <Star className="h-2.5 w-2.5 ml-0.5 fill-yellow-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback URL */}
          <Card className="border p-2 gap-0">
            <CardHeader className="p-1 pb-1">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                Feedback Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
              <div>
                <Label className="text-xs">Feedback URL</Label>
                <div className="relative">
                  <Input
                    value={`${
                      typeof window !== "undefined"
                        ? window.location.origin
                        : ""
                    }/feedback/${initialData?._id || "product_id"}`}
                    readOnly
                    className="text-xs h-7 pr-16"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-0.5 top-0.5 h-6 text-[0.625rem]"
                    onClick={() => {
                      const url = `${window.location.origin}/feedback/${
                        initialData?._id || "product_id"
                      }`;
                      navigator.clipboard.writeText(url);
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-[0.625rem] text-muted-foreground mt-0.5">
                  Share this URL to collect feedback
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  }
);

ProductForm.displayName = "ProductForm";
