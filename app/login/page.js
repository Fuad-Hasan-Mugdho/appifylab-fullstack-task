"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitLogin(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.message || "Login failed.");
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <section className="_social_login_wrapper _layout_main_wrapper">
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
      <div className="_social_login_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_login_left">
                <div className="_social_login_left_image">
                  <Image src="/assets/images/login.png" alt="Login" className="_left_img" width={680} height={540} priority />
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_login_content">
                <div className="_social_login_left_logo _mar_b28">
                  <img src="/assets/images/logo.svg" alt="Buddy Script" className="_left_logo" />
                </div>
                <p className="_social_login_content_para _mar_b8">Welcome back</p>
                <h4 className="_social_login_content_title _titl4 _mar_b50">Login to your account</h4>
                {message ? <div className="app_message app_message_error">{message}</div> : null}
                <form className="_social_login_form" onSubmit={submitLogin}>
                  <div className="_social_login_form_input _mar_b14">
                    <label className="_social_login_label _mar_b8" htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" className="form-control _social_login_input" value={form.email} onChange={updateField} required />
                  </div>
                  <div className="_social_login_form_input _mar_b14">
                    <label className="_social_login_label _mar_b8" htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" className="form-control _social_login_input" value={form.password} onChange={updateField} required />
                  </div>
                  <div className="_social_login_form_btn _mar_t40 _mar_b60">
                    <button type="submit" className="_social_login_form_btn_link _btn1" disabled={loading}>
                      {loading ? "Logging in..." : "Login now"}
                    </button>
                  </div>
                </form>
                <div className="_social_login_bottom_txt">
                  <p className="_social_login_bottom_txt_para">
                    Dont have an account? <Link href="/register">Create New Account</Link>
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
