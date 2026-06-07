"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitRegister(event) {
    event.preventDefault();
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.message || "Registration failed.");
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <section className="_social_registration_wrapper _layout_main_wrapper">
      <div className="_shape_one">
        <img src="/assets/images/shape1.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape.svg" alt="" className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <img src="/assets/images/shape2.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape1.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_shape_three">
        <img src="/assets/images/shape3.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape2.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_social_registration_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_registration_right">
                <div className="_social_registration_right_image">
                  <Image src="/assets/images/registration.png" alt="Registration" width={700} height={560} priority />
                </div>
                <div className="_social_registration_right_image_dark">
                  <img src="/assets/images/registration1.png" alt="" />
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_registration_content">
                <div className="_social_registration_right_logo _mar_b28">
                  <img src="/assets/images/logo.svg" alt="Buddy Script" className="_right_logo" />
                </div>
                <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
                <h4 className="_social_registration_content_title _titl4 _mar_b50">Registration</h4>
                {message ? <div className="app_message app_message_error">{message}</div> : null}
                <form className="_social_registration_form" onSubmit={submitRegister}>
                  <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="firstName">First name</label>
                        <input id="firstName" name="firstName" className="form-control _social_registration_input" value={form.firstName} onChange={updateField} required />
                      </div>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="lastName">Last name</label>
                        <input id="lastName" name="lastName" className="form-control _social_registration_input" value={form.lastName} onChange={updateField} required />
                      </div>
                    </div>
                  </div>
                  <div className="_social_registration_form_input _mar_b14">
                    <label className="_social_registration_label _mar_b8" htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" className="form-control _social_registration_input" value={form.email} onChange={updateField} required />
                  </div>
                  <div className="_social_registration_form_input _mar_b14">
                    <label className="_social_registration_label _mar_b8" htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" className="form-control _social_registration_input" value={form.password} onChange={updateField} required />
                  </div>
                  <div className="_social_registration_form_input _mar_b14">
                    <label className="_social_registration_label _mar_b8" htmlFor="confirmPassword">Repeat Password</label>
                    <input id="confirmPassword" name="confirmPassword" type="password" className="form-control _social_registration_input" value={form.confirmPassword} onChange={updateField} required />
                  </div>
                  <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                    <button type="submit" className="_social_registration_form_btn_link _btn1" disabled={loading}>
                      {loading ? "Creating..." : "Create account"}
                    </button>
                  </div>
                </form>
                <div className="_social_registration_bottom_txt">
                  <p className="_social_registration_bottom_txt_para">
                    Already have an account? <Link href="/login">Login now</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
